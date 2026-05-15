# Supabase Warning Hardening Plan

This plan covers the remaining Supabase Security Advisor warnings after the seven `RLS Disabled in Public` errors were cleared.

The goal is not to make the warning count hit zero in one heroic pass. The goal is to reduce real exposure while preserving the working app, especially because `test` and `prod` share one Supabase database.

## Current Warning Buckets

The exported Advisor CSV contains 44 warnings:

- 3 `rls_policy_always_true`
- 12 `pg_graphql_anon_table_exposed`
- 12 `pg_graphql_authenticated_table_exposed`
- 8 `anon_security_definer_function_executable`
- 8 `authenticated_security_definer_function_executable`
- 1 `auth_leaked_password_protection`

## Safety Principles

- Do not click broad automatic `Resolve issue` actions for these warnings.
- Do one warning bucket at a time.
- Keep rollback SQL or Dashboard reversal steps open before applying each phase.
- Prefer changes that can be verified with one narrow smoke test before moving on.
- Assume a database permission change affects both hosted `test` and hosted `prod`.
- Keep an already-signed-in admin session open during SQL changes.
- Use SQL Editor/project-owner access as the break-glass path if browser-client access regresses.

## Phase 0: Baseline And Backup

Goal: make sure we can tell whether a later warning fix caused a regression.

Preflight:

- Export the latest Advisor CSV.
- Confirm current `test` and `prod` login still work.
- Confirm Pam admin can open Dashboard, Library, one book modal, Settings, and Import if visible.
- Keep `public_rls_hardening_rollback.sql` available, although the new phases should each get their own narrower rollback.

Secondary impacts:

- None. This phase is read-only.

Stop gate:

- Do not harden more permissions if the app already has an unrelated login, club switcher, or save issue.

## Phase 1: Enable Leaked Password Protection

Goal: clear the lowest-risk Auth warning first.

Action:

- Enable Supabase Auth leaked-password protection in the Dashboard.

Current status:

- Deferred. Supabase requires configuring a custom email provider before this setting can be enabled.
- Do not configure an email provider solely to clear this warning without separately planning email deliverability and signup/password-reset impacts.

Expected impact:

- New signups, password resets, or password changes may reject known-compromised passwords.
- Existing working sessions should not be affected.

Secondary impacts:

- A test signup using a deliberately common password may fail with a stronger password requirement.
- If a current user later tries to set a compromised password, Supabase may block it. That is desired.

Verification:

- Existing user can still log into `test`.
- Existing user can still log into `prod`.
- Optional: attempt a new test signup with a strong password and valid invite code only if we are actively testing signup.

Rollback:

- Disable the same Auth setting in Supabase Dashboard if it unexpectedly blocks legitimate login behavior.

## Phase 2: Remove GraphQL Exposure

Goal: clear the 24 GraphQL exposure warnings if the app does not use GraphQL.

Current evidence:

- The app uses Supabase REST-style calls such as `.from('book_club_list')`.
- Repo search found no app calls to Supabase GraphQL.

Preferred action:

- Disable the `pg_graphql` extension if we do not intentionally use Supabase GraphQL.

Current status:

- Complete. `pg_graphql` was disabled from the Supabase Extensions screen.
- Pam verified no issues in hosted `test` or hosted `prod` after disabling it.
- Supabase Security Advisor warning count dropped from 44 to 20 after refresh, consistent with the 24 GraphQL exposure warnings clearing.

Alternative action:

- Revoke GraphQL-visible grants table by table if disabling the extension is unavailable or undesirable.

Expected impact:

- Normal Supabase JS REST queries should continue to work.
- Supabase GraphQL playground or any external GraphQL client would stop seeing these objects.

Secondary impacts:

- If an untracked integration uses GraphQL, it will break.
- Advisor warnings may persist until the Advisor is refreshed.
- If Supabase blocks disabling the extension because of dependencies, stop and use the grants approach instead.

Verification:

- App login still works.
- Dashboard loads.
- Library loads.
- Book modal opens.
- Security Advisor count drops by up to 24 warnings.

Rollback:

- Re-enable `pg_graphql` if disabling the extension breaks an integration.
- If using grants, restore only the previous grants that were revoked.

## Phase 3: Restrict Direct Function Execution

Goal: prevent helper and trigger `SECURITY DEFINER` functions from being callable as public RPC endpoints.

Warnings:

- `can_manage_club`
- `enforce_book_club_list_member_writes`
- `is_active_club_member`
- `is_any_club_admin`
- `is_book_club_admin`
- `is_platform_owner`
- `log_schedule_change_from_book_update`
- `touch_user_last_seen`

Current evidence:

- The browser app directly calls only `touch_user_last_seen()` via `supabase.rpc(...)`.
- Trigger functions should not be callable directly by `anon` or `authenticated`.
- RLS helper functions may be better moved to a non-exposed schema, but that requires careful policy rewrites.

Recommended phased approach:

1. Revoke direct execution from `anon` for all eight functions.
2. Revoke direct execution from `authenticated` for trigger-only functions:
   - `enforce_book_club_list_member_writes`
   - `log_schedule_change_from_book_update`
3. Keep `authenticated` execution for `touch_user_last_seen` because the app intentionally calls it.
4. For the RLS helper functions, test whether revoking direct `authenticated` execution breaks policies. If it does, do not force it; instead plan a later migration to a private/non-exposed helper schema.

Expected impact:

- Direct RPC calls to trigger/helper functions should stop working.
- Normal table reads/writes should keep working if policies still evaluate correctly.

Secondary impacts:

- If an RLS policy requires caller `EXECUTE` permission for a helper function, revoking too much can make normal table queries fail with permission errors.
- If `touch_user_last_seen` loses authenticated execution, login/session initialization may log warnings and fall back to direct profile update behavior.
- Moving functions between schemas later will require updating every policy that references them.

Verification:

- Login loads without a new `touch_user_last_seen` failure.
- Dashboard and Library still load.
- Book modal update still saves.
- Schedule-change notification behavior still works after changing date/host/time.
- Security Advisor function warnings drop only for functions no longer directly executable.

Rollback:

- Re-grant `EXECUTE` only for the function/role combination that caused the regression.

## Phase 4: Harden `book_club_list` Broad Write Policies

Goal: replace broad authenticated `INSERT` and `UPDATE` policies with club-scoped policies.

Warnings:

- `book_club_list` `INSERT` policy uses `WITH CHECK (true)`.
- `book_club_list` `UPDATE` policy uses `USING (true)` and `WITH CHECK (true)`.

Current evidence:

- Saving search results inserts into `book_club_list`.
- Updating a book modal writes status, rating, tags, meeting date/time, host, notes, and modification metadata.
- Discussion guide edits update `discussion_questions`.
- Existing trigger `enforce_book_club_list_member_writes()` limits non-admin changes, but the RLS policy is still too broad.

Recommended policy direction:

- `SELECT`: active club members can read books for their clubs.
- `INSERT`: active club members can insert only into their current/member club; members insert only `Proposed`, admins/managers can insert normal backlog items.
- `UPDATE`: active club members can update rows in their club, with trigger enforcement preserving field-level limits until policies are refined further.
- `DELETE`: admins/managers only.
- Long term: align this with the new per-club `manager` role rather than legacy global `user_profiles.role`.

Expected impact:

- A user should no longer be able to write books into a club they do not belong to.
- Members should still be able to propose books and update allowed personal/shared meeting fields.
- Admins should still be able to import, edit guides, change status, and delete.

Secondary impacts:

- Search `Save` can fail if `currentActiveClubId` is missing or stale.
- Imports can fail if import inserts do not include `club_id` or if admin role detection is still legacy-only.
- Status auto-sync can fail if it runs for books outside the active club.
- Discussion guide saves can fail for admins if policy and trigger disagree on what “admin” means.
- Mobile modal updates could appear to save locally but fail remotely if error handling misses a policy error.

Verification:

- Admin save from Find Books.
- Member propose from Find Books.
- Admin edit status/date/time/host/tags/notes.
- Member edit allowed fields.
- Admin edit/generate discussion guide.
- Admin delete.
- Import flow.
- Club switcher shows each club's correct library without cross-club leakage.

Rollback:

- Restore the previous broad policies only if a critical flow breaks and a narrow forward fix is not obvious.
- Prefer forward-fixing policy predicates over leaving broad policies in place long term.

## Phase 5: Replace Browser `invite_codes` Writes

Goal: remove the broad `invite_codes` authenticated update policy without breaking signup.

Warning:

- `invite_codes` `UPDATE` policy allows unrestricted authenticated updates.

Current evidence:

- Signup reads the invite code from the browser before creating the Auth user.
- Signup increments `current_uses` from the browser after Auth signup.

Recommended direction:

- Replace browser-side invite validation/consumption with trusted database RPC or server-side flow.
- Return only minimal validation information to the browser.
- Make invite consumption atomic so two signups cannot exceed `max_uses`.

Expected impact:

- Invite code details become less exposed.
- Users should still be able to sign up with valid invite codes.
- Invalid, expired, future, or exhausted codes should fail cleanly.

Secondary impacts:

- Supabase email-confirmation behavior may mean the new user is not fully authenticated immediately after `signUp`; this affects where invite consumption can safely happen.
- If invite consumption moves before user creation, failed Auth signup could consume an invite incorrectly unless handled carefully.
- If invite consumption moves after user creation, failed profile creation/member assignment could leave a valid Auth user without app access.
- Race-condition handling may change current `current_uses` counts.

Verification:

- Signup with valid code.
- Signup with invalid code.
- Signup with expired/future code if fixtures exist.
- Max-use code cannot be overused.
- New user can log in after email verification and sees the correct club context.

Rollback:

- Restore the old update policy and old browser flow only if signup is blocked and cannot be forward-fixed quickly.

## Phase 6: Broader Table And Profile Cleanup

Goal: address related security shape that may not currently be in the 44-warning CSV but affects the same attack surface.

Candidates:

- `schedule_changes` read scope and trusted trigger behavior.
- `user_dismissed_notifications` per-user scoping.
- `user_profiles` exposure and legacy role reliance.
- Migration away from `user_profiles.role` as the long-term authorization source.

Secondary impacts:

- Notification rendering can lose history if `schedule_changes` is too strict.
- Members may lose profile visibility if the app needs display names for shared features.
- Admin-only UI can disagree with database permissions during the transition from legacy role to club membership role.

Verification:

- Notifications load and can be dismissed.
- Display names still render where expected.
- Admin/member UI state matches actual database permissions.

## Recommended Next Step

Start with Phase 1 and Phase 2:

1. Enable leaked password protection.
2. Disable `pg_graphql` if no one uses GraphQL.
3. Rerun Advisor and record the new warning count.

Do not start `book_club_list` or `invite_codes` policy changes until we prepare dedicated preflight SQL, forward SQL, rollback SQL, and a smoke checklist for each.
