# RLS Hardening Plan

This is the phased plan for resolving Supabase Security Advisor `RLS Disabled in Public` findings without locking ourselves out of normal app work.

## Safety Principles

- Do not click Supabase's automatic `Resolve issue` button for these tables.
- Do not run the forward SQL until the preflight checks are clean.
- Keep Supabase SQL Editor open during the rollout with both forward and rollback SQL ready.
- Apply changes during a quiet window because `test` and `prod` share one Supabase database.
- If a phase fails, stop and fix that phase before continuing.

## Break-Glass Recovery

Before running any RLS changes:

- Confirm you can access Supabase Dashboard and SQL Editor as project owner.
- Open `public_rls_hardening_rollback.sql` in a second SQL Editor tab.
- Export or copy the current rows for the affected tables.
- Keep one browser session already signed into Book Club Companion as admin.
- Keep one private/incognito browser available for a fresh login test.

If the app locks users out after the forward migration:

1. Run `public_rls_hardening_rollback.sql` from Supabase SQL Editor.
2. Refresh the app and confirm login / dashboard recover.
3. Do not retry the forward SQL until the blocked policy is identified.

Supabase SQL Editor/project-owner access should remain available even if browser-client RLS policies block the app, but we should still prepare rollback before touching anything.

## Phase 1: Read-Only Inventory

Goal: understand current live data shape before enabling RLS.

Run read-only checks in Supabase SQL Editor:

Preferred: run `public_rls_preflight_checks.sql` and save the results.

The most important stop/go outputs are:

- users with no active memberships
- preferences pointing to inaccessible clubs
- clubs with no active members
- missing key columns or unexpected id/club_id types
- existing policies we might overwrite or duplicate

```sql
select
    schemaname,
    tablename,
    rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
      'clubs',
      'club_settings',
      'club_memberships',
      'user_preferences',
      'platform_roles',
      'club_invites',
      'club_invite_consumptions',
      'book_club_list',
      'schedule_changes',
      'user_profiles',
      'invite_codes'
  )
order by tablename;
```

```sql
select 'clubs' as table_name, count(*) from public.clubs
union all select 'club_settings', count(*) from public.club_settings
union all select 'club_memberships', count(*) from public.club_memberships
union all select 'user_preferences', count(*) from public.user_preferences
union all select 'platform_roles', count(*) from public.platform_roles
union all select 'club_invites', count(*) from public.club_invites
union all select 'club_invite_consumptions', count(*) from public.club_invite_consumptions;
```

```sql
select column_name, data_type, udt_name
from information_schema.columns
where table_schema = 'public'
  and table_name in (
      'clubs',
      'club_settings',
      'club_memberships',
      'user_preferences',
      'platform_roles',
      'club_invites',
      'club_invite_consumptions'
  )
  and column_name in ('id', 'club_id', 'user_id', 'created_by', 'updated_by', 'active_club_id', 'invite_id')
order by table_name, ordinal_position;
```

Stop gate:

- Do not continue if `clubs.id` / `club_id` are not `bigint` or integer-compatible with the draft helper functions.
- Do not continue if any of the seven tables are missing expected columns.

## Phase 2: Find Data That Would Be Blocked

Goal: find rows/users that current app fallback behavior relies on but strict RLS would hide.

```sql
select up.id, up.display_name, up.role
from public.user_profiles up
where not exists (
    select 1
    from public.club_memberships cm
    where cm.user_id = up.id
      and cm.status = 'active'
);
```

```sql
select pref.user_id, pref.active_club_id
from public.user_preferences pref
where pref.active_club_id is not null
  and not exists (
      select 1
      from public.club_memberships cm
      where cm.user_id = pref.user_id
        and cm.club_id = pref.active_club_id
        and cm.status = 'active'
  );
```

```sql
select c.id, c.name, c.slug, c.club_type, c.created_by
from public.clubs c
where not exists (
    select 1
    from public.club_memberships cm
    where cm.club_id = c.id
      and cm.status = 'active'
);
```

Stop gate:

- If any rows appear, decide whether to backfill memberships/preferences before enabling RLS.
- Do not proceed until Pam's own user has an active admin membership in the primary club and any sandbox clubs she needs.
- If Pam does not appear in the admin/manager membership check for the clubs she needs, stop and fix membership data first.

## Phase 3: Patch The Forward SQL Before Running

Goal: avoid known lockout risks.

Required review points:

- `public.is_active_club_member(target_club_id bigint)` must match live `club_id` type.
- `clubs` select policy should allow either active members or `created_by = auth.uid()` so the create-sandbox-club flow can read the row it just inserted before membership exists.
- `user_preferences` insert/update policy should only allow `active_club_id` values where the user has active membership.
- `platform_roles` should not have browser write policies.
- `club_invite_consumptions` should not have direct browser write policies until invite redemption is converted to trusted RPC/server flow.

## Phase 4: Apply In A Controlled Window

Goal: make the smallest reversible security change.

Steps:

1. Confirm rollback SQL is open in a separate Supabase SQL tab.
2. Confirm the admin app session is open.
3. Run the final reviewed `public_rls_hardening.sql`, or apply it in phased chunks: helpers/indexes first, policies second, RLS enablement last.
4. Do not close SQL Editor.
5. Immediately run the Phase 5 smoke tests.

Rollout note:

- On 2026-05-14, the shared Supabase database was hardened using the phased-chunk approach.
- Verification confirmed all seven flagged public tables report `rowsecurity = true`.

## Phase 5: Immediate Smoke Tests

Run these in the hosted `test` URL after the SQL is applied:

- Existing admin can log in.
- Existing member can log in.
- Club switcher shows only clubs the user belongs to.
- Dashboard loads next meeting and upcoming books.
- Library loads books for the active club.
- Book modal opens and saves allowed edits.
- Admin-only actions still show for admin and stay hidden for member.
- Create sandbox club works end-to-end.
- Switching active club persists after refresh.
- Notifications load.
- Signup with current legacy `invite_codes` still works, if we are testing signup during this window.

Stop gate:

- If login/club context/dashboard fails for admin, run rollback immediately.
- If only one narrow flow fails, decide whether to patch policy forward or rollback based on severity.

## Phase 6: Advisor And Abuse Checks

After app smoke passes:

- Rerun Supabase Security Advisor.
- Confirm the seven `RLS Disabled in Public` findings are gone.
- Use a non-member account to confirm it cannot see unrelated clubs, memberships, preferences, or settings.
- Use a member account to confirm it cannot update `platform_roles` or forge invite consumption rows.

## Phase 7: Follow-Up Hardening

This first pass only addresses the seven disabled-RLS findings. Follow-up work should verify:

- `book_club_list` policies are club-scoped and not broad `authenticated using true`.
- `schedule_changes` policies are club-scoped.
- Legacy `invite_codes` signup is still acceptable or should be replaced by trusted club invite redemption.
- Club creation should eventually move to a trusted RPC so the app does not rely on multi-step client inserts.
