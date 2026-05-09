# Release Log

Use this file as the lightweight audit trail for `test` and `prod` rollouts.

## How To Use

- Add one entry for every meaningful `test` deployment.
- Update the same entry when it is promoted to `prod`.
- Record code, config, and database changes together.
- If a rollout includes manual Supabase SQL, name the SQL file or describe the exact query.
- If the app version did not change, say that explicitly.

## Entry Template

```md
## YYYY-MM-DD - Short Title
- Version: `vX.Y.Z` or `unchanged`
- Test commit: `<sha>`
- Prod commit: `<sha>` or `not yet`
- Environments: `test`, `prod`
- User-facing changes:
  - ...
- Operational changes:
  - Env vars: ...
  - Database / SQL: ...
  - Branch / deployment notes: ...
- Validation:
  - ...
- Rollback:
  - Code: revert to `<sha>`
  - Database: `<rollback sql file or note>`
```

## 2026-05-09 - Library Refresh Button Removal
- Version: `v1.9.15`
- Test commit: `eb28e2a`
- Prod commit: `not yet`
- Environments: `test`
- User-facing changes:
  - Removed the redundant `Refresh` button from the library toolbar.
- Operational changes:
  - Database / SQL:
    - none
  - Branch / deployment notes:
    - Library loading continues through the existing startup, save, import, edit, delete, and club-switch flows.
- Validation:
  - Local served app on `8080` loaded the library normally without the button.
- Rollback:
  - Code: restore the removed toolbar button and direct reload wiring
  - Database: not applicable

## 2026-05-01 - Search, Ratings, and Vision Import Hardening
- Version: `v1.9.9`
- Test commit: `daa487c`
- Prod commit: `0f97ad9`
- Environments: `test`, `prod`
- User-facing changes:
  - Book search was restored through the deployed `/api/books` route.
  - Goodreads ratings became more reliable through the server-side proxy path.
  - Vision Import stopped requiring a browser-stored Gemini key.
- Operational changes:
  - Env vars:
    - Added `GOOGLE_BOOKS_API_KEY` in Vercel.
    - Replaced the Vercel `GEMINI_API_KEY` with a fresh value.
  - Database / SQL:
    - none
  - Branch / deployment notes:
    - Search was first repaired on `test`, then promoted to `prod`.
- Validation:
  - Normal in-app search worked.
  - `/api/books?q=the%20hobbit` returned JSON.
  - Goodreads refresh and Vision Import were manually verified on `test` before promotion.
- Rollback:
  - Code: revert before `0f97ad9`
  - Database: not applicable

## 2026-05-02 - Admin / Saved Status Promotion
- Version: `v1.9.9` (unchanged)
- Test commit: `a78a499`
- Prod commit: `aba300c`
- Environments: `test`, `prod`
- User-facing changes:
  - Members may still set host, date, and time.
  - Members may view / print / download discussion guides but may not overwrite them.
  - `Saved` status handling is consistent instead of sometimes acting like blank status.
- Operational changes:
  - Database / SQL:
    - Manual Supabase step applied: `admin_write_guards.sql`
    - This included the `Saved` / `Test` status constraint update and admin-only delete / write protections.
  - Branch / deployment notes:
    - `test` was promoted to `prod` after manual validation.
- Validation:
  - Member and admin workflows were checked on `test`.
  - Production smoke test looked good after promotion.
- Rollback:
  - Code: revert before `aba300c`
  - Database: reapply the prior policies/constraint state or use the saved SQL rollback notes from the session

## 2026-05-02 - User Profile Hardening
- Version: `v1.9.9` (unchanged)
- Test commit: `6a5d568`
- Prod commit: `ae092de`
- Environments: `test`, `prod`
- User-facing changes:
  - No intended UI change.
  - App now prefers a trusted `touch_user_last_seen()` RPC and only falls back to direct profile writes for compatibility.
- Operational changes:
  - Database / SQL:
    - Manual Supabase step applied: created `public.touch_user_last_seen()`
    - Manual Supabase step applied: tightened `user_profiles` insert/update rules so authenticated users can only update `display_name`
    - Forward SQL file: `user_profiles_hardening.sql`
    - Rollback SQL file: `user_profiles_hardening_rollback.sql`
  - Branch / deployment notes:
    - Code was promoted to `test` first, then to `prod`, before tightening the shared database permissions.
- Validation:
  - Quick `test` sanity pass looked normal before the SQL change.
  - Production login and ordinary use were re-checked after promotion.
- Rollback:
  - Code: revert before `6a5d568` on `test` and before `ae092de` on `prod`
  - Database: use `user_profiles_hardening_rollback.sql`

## 2026-05-03 - Trusted Schedule Change Logging
- Version: `v1.9.10`
- Test commit: `92b4938`
- Prod commit: `ddd444d`
- Environments: `test`, `prod`
- User-facing changes:
  - Schedule edits for host, date, and time continue to generate notifications.
  - Notification text is safely escaped before rendering.
- Operational changes:
  - Database / SQL:
    - Manual Supabase step applied: created `public.log_schedule_change_from_book_update()`
    - Manual Supabase step applied: attached trigger `trg_log_schedule_change_from_book_update` on `public.book_club_list`
    - Manual Supabase step applied: removed direct authenticated `insert` permission on `public.schedule_changes`
    - Forward SQL file: `schedule_changes_hardening.sql`
    - Rollback SQL file: `schedule_changes_hardening_rollback.sql`
  - Branch / deployment notes:
    - App code includes a compatibility bridge so notifications still work before and after the DB trigger rollout.
    - Version bump and release-log update landed on `test` before the production promotion.
- Validation:
  - Localhost verified on `http://127.0.0.1:8082`
  - `test` verified with a real schedule edit and a single normal notification
  - `prod` verified with a real schedule edit and a single normal notification
- Rollback:
  - Code: revert before `92b4938` on `test` and before `ddd444d` on `prod`
  - Database: use `schedule_changes_hardening_rollback.sql`

## 2026-05-08 - Multi-Club App Awareness For Sandbox Testing
- Version: `v1.9.11`
- Test commit: `b29d51a`
- Prod commit: `not yet`
- Environments: `test`
- User-facing changes:
  - Added app-side active-club awareness for the current seeded club and sandbox clubs.
  - Added a current-club switcher in the header with sandbox badges and active navigation styling.
  - Added sandbox club creation from the switcher for admins.
  - Improved startup hydration with a loading state so the library does not appear blank during club-context resolution.
  - Updated dashboard empty-state and navigation behavior so club switching returns to the club dashboard and dashboard CTAs use the same section navigation as the header.
- Operational changes:
  - Database / SQL:
    - none in this rollout; relies on the previously applied multi-club foundation schema
  - Branch / deployment notes:
    - intended for lower-environment sandbox-club validation only
    - platform owner and club-member management remain out of scope for this slice
- Validation:
  - local interactive testing covered club creation, club switching, startup hydration, and navigation behavior
  - real API validation is deferred to `test`
- Rollback:
  - Code: revert before this release on `test`
  - Database: not applicable

## 2026-05-09 - Sandbox First-Search Reliability
- Version: `v1.9.12`
- Test commit: `c44b157`
- Prod commit: `not yet`
- Environments: `test`
- User-facing changes:
  - Search now waits for auth hydration before the first protected `/api/books` request.
  - The first books search retries one `401` once before surfacing an error.
  - Search now shows a session-specific message when auth/session readiness is the likely cause.
- Operational changes:
  - Database / SQL:
    - none
  - Branch / deployment notes:
    - targeted reliability fix for the sandbox-club first-search failure after hard refresh
- Validation:
  - user reproduced the failure after hard refresh in sandbox on `test`
  - fix validated with code review and targeted runtime guard changes before deployment
- Rollback:
  - Code: revert before this release on `test`
  - Database: not applicable

## 2026-05-09 - Sandbox Search Auth Refresh
- Version: `v1.9.13`
- Test commit: `db84901`
- Prod commit: `not yet`
- Environments: `test`
- User-facing changes:
  - Protected search requests now force a Supabase session refresh after a `401` before surfacing failure.
  - Search now shows the underlying API error message instead of collapsing everything into a generic failure.
- Operational changes:
  - Database / SQL:
    - none
  - Branch / deployment notes:
    - follow-up to the sandbox first-search investigation after `v1.9.12` did not resolve the test failure
- Validation:
  - user reproduced the sandbox search failure on `v1.9.12`
  - fix prepared for immediate `test` validation
- Rollback:
  - Code: revert before this release on `test`
  - Database: not applicable

## 2026-05-09 - Google Books Transient Retry
- Version: `v1.9.14`
- Test commit: `872400c`
- Prod commit: `not yet`
- Environments: `test`
- User-facing changes:
  - Search now retries transient Google Books upstream failures (`502`, `503`, `504`) inside the server-side proxy before surfacing an error.
- Operational changes:
  - Database / SQL:
    - none
  - Branch / deployment notes:
    - follow-up to the sandbox search investigation after the underlying error was identified as `Service temporarily unavailable.`
- Validation:
  - user reproduced the upstream service-unavailable error on `v1.9.13`
  - retry/backoff added at the proxy layer so client behavior stays simple
- Rollback:
  - Code: revert before this release on `test`
  - Database: not applicable
