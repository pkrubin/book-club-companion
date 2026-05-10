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

## 2026-05-10 - Mobile Book Modal Date and Header Tightening
- Version: `v1.9.22`
- Test commit: `646faab`
- Prod commit: `not yet`
- Environments: `test`
- User-facing changes:
  - Fixed the mobile Target Date field so the clear trash icon no longer overlaps the year.
  - Prevented the Target Date field from overflowing into Meeting Time on iPhone.
  - Moved the rating and refresh action under the book cover on mobile, like the dashboard card pattern.
  - Hid the lower-priority Library/WorldCat link on mobile so the modal header has fewer action rows.
- Operational changes:
  - Env vars: none
  - Database / SQL: none
  - Branch / deployment notes:
    - Follow-up to real iPhone screenshot review of `v1.9.21`.
- Validation:
  - `node --check js/app.js`
  - `node --check local_server.js`
  - `git diff --check`
  - Local served app returned `200 OK` on `http://127.0.0.1:8080`
  - Local logged-out browser smoke loaded `v1.9.22` with no console errors.
  - Authenticated phone and iPad flows still need human verification on `test`.
- Rollback:
  - Code: revert this test release commit
  - Database: not applicable

## 2026-05-10 - Mobile Dashboard and Book Action Cleanup
- Version: `v1.9.21`
- Test commit: `a2eaeff`
- Prod commit: `not yet`
- Environments: `test`
- User-facing changes:
  - Removed the redundant dashboard hero `View Details` button because the card itself opens book details.
  - Added same-row Calendar and Guide actions to dashboard books.
  - Tightened the mobile book detail modal by placing the cover beside compact rating, refresh, external-link, and Guide actions.
- Operational changes:
  - Env vars: none
  - Database / SQL: none
  - Branch / deployment notes:
    - Follow-up to real iPhone review of remaining dashboard and book modal density concerns.
- Validation:
  - `node --check js/app.js`
  - `node --check local_server.js`
  - `git diff --check`
  - Local served app returned `200 OK` on `http://127.0.0.1:8080`
  - Local logged-out browser smoke loaded `v1.9.21` with no console errors.
  - Authenticated phone and iPad flows still need human verification on `test`.
- Rollback:
  - Code: revert this test release commit
  - Database: not applicable

## 2026-05-10 - Mobile Date Field Icon Fix
- Version: `v1.9.20`
- Test commit: `c5c2d79`
- Prod commit: `not yet`
- Environments: `test`
- User-facing changes:
  - Fixed the small trash-can clear icon overlapping the year in the mobile book detail Target Date field.
  - Kept the compact two-column mobile edit layout while reserving explicit text space inside the date input.
- Operational changes:
  - Env vars: none
  - Database / SQL: none
  - Branch / deployment notes:
    - Follow-up to real iPhone review of the `v1.9.18`/`v1.9.19` book detail modal.
- Validation:
  - `node --check js/app.js`
  - `node --check local_server.js`
  - `git diff --check`
  - Local served app returned `200 OK` on `http://127.0.0.1:8080`
  - Local logged-out browser smoke loaded `v1.9.20` with no console errors.
  - Authenticated phone and iPad flows still need human verification on `test`.
- Rollback:
  - Code: revert this test release commit
  - Database: not applicable

## 2026-05-10 - iPhone Home Screen Icon Setup
- Version: `v1.9.19`
- Test commit: `22e4e6a`
- Prod commit: `not yet`
- Environments: `test`
- User-facing changes:
  - Reused the existing Book Club Companion icon for iPhone/iPad Add to Home Screen setup.
  - Added Apple touch icon metadata and a web app manifest so the saved Home Screen shortcut has the proper name and icon.
- Operational changes:
  - Env vars: none
  - Database / SQL: none
  - Branch / deployment notes:
    - Generated `180x180`, `192x192`, and `512x512` icon assets from `images/logo-icon.png`.
    - Added the `.webmanifest` MIME type to the local development server for cleaner local validation.
- Validation:
  - `node --check js/app.js`
  - `node --check local_server.js`
  - `git diff --check`
  - Local manifest and icon assets returned `200 OK`.
  - Local manifest served as `application/manifest+json; charset=utf-8`.
  - Home-screen icon behavior still needs verification from Safari on iPhone/iPad after `test` deploys.
- Rollback:
  - Code: revert this test release commit
  - Database: not applicable

## 2026-05-10 - Mobile Book Detail Modal Cleanup
- Version: `v1.9.18`
- Test commit: `8a15ad7`
- Prod commit: `not yet`
- Environments: `test`
- User-facing changes:
  - Tightened the mobile book detail modal so the cover, rating, links, and discussion-guide action take much less vertical space.
  - Demoted Goodreads, Amazon, and Library from large stacked buttons into compact secondary links.
  - Shrunk mobile tags back into compact chips and paired schedule fields into two-column rows where phone width allows.
- Operational changes:
  - Env vars: none
  - Database / SQL: none
  - Branch / deployment notes:
    - Follow-up to real iPhone screenshots from `v1.9.17`.
- Validation:
  - `node --check js/app.js`
  - `git diff --check`
  - Local served app returned `200 OK` on `http://127.0.0.1:8080`
  - Local logged-out browser smoke loaded `v1.9.18` with no console errors.
  - Authenticated phone and iPad flows still need human verification on `test`.
- Rollback:
  - Code: revert this test release commit
  - Database: not applicable

## 2026-05-10 - Phone-First Mobile Layout Correction
- Version: `v1.9.17`
- Test commit: `f959cf2`
- Prod commit: `not yet`
- Environments: `test`
- User-facing changes:
  - Reworked the phone header into a compact two-row pattern instead of wrapping desktop controls into three rows.
  - Moved mobile `Sign Out` and admin `Import Books` actions into Settings so primary navigation stays focused on Dashboard, Find Books, and Library.
  - Converted the mobile dashboard hero from a full-cover image block into a compact next-meeting card with a thumbnail, readable metadata, and no content overlap.
  - Improved Find Books mobile spacing so the search field and Search button read as separate, tappable controls.
  - Replaced the mobile library filter stack with one `Filter & Sort` button that opens a bottom sheet, keeping books visible first.
- Operational changes:
  - Env vars: none
  - Database / SQL: none
  - Branch / deployment notes:
    - Follow-up to the `v1.9.16` hosted test discovery pass from real iPhone screenshots.
- Validation:
  - `node --check js/app.js`
  - `git diff --check`
  - Local served app loaded at iPhone `390x844` with no console errors while logged out.
  - Authenticated phone and iPad flows still need human verification on `test`.
- Rollback:
  - Code: revert this test release commit
  - Database: not applicable

## 2026-05-10 - Mobile Accessibility Test Release
- Version: `v1.9.16`
- Test commit: `fe20920`
- Prod commit: `not yet`
- Environments: `test`
- User-facing changes:
  - Improved iPhone ergonomics for login, navigation, search, library controls, tables/cards, modals, import review, discussion guide, and settings surfaces.
  - Added larger mobile tap targets, safer mobile overflow behavior, responsive filters, and mobile-friendly dialog sizing.
  - Fixed unauthenticated app-content bleed so hidden app content no longer appears below the login view or in the accessibility tree.
- Operational changes:
  - Env vars: none
  - Database / SQL: none
  - Branch / deployment notes:
    - Prepared for device validation on the hosted `test` environment because local iPhone/iPad access to port `8080` was unreliable.
- Validation:
  - `node --check js/app.js`
  - `git diff --check`
  - Local served app returned `200 OK` on `http://127.0.0.1:8080`
  - Browser smoke at iPhone `390x844` and tablet `768x1024` completed with no console errors.
  - Authenticated mobile flows still need human verification on `test`.
- Rollback:
  - Code: revert this test release commit
  - Database: not applicable

## 2026-05-09 - Library Refresh Button Removal
- Version: `v1.9.15`
- Test commit: `eb28e2a`
- Prod commit: `75000d9`
- Environments: `test`, `prod`
- User-facing changes:
  - Removed the redundant `Refresh` button from the library toolbar.
- Operational changes:
  - Database / SQL:
    - none
  - Branch / deployment notes:
    - Library loading continues through the existing startup, save, import, edit, delete, and club-switch flows.
- Validation:
  - Local served app on `8080` loaded the library normally without the button.
  - Promoted to `prod` successfully on 2026-05-09 as part of the reconciled multi-club release.
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
- Prod commit: `75000d9`
- Environments: `test`, `prod`
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
- Prod commit: `75000d9`
- Environments: `test`, `prod`
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
- Prod commit: `75000d9`
- Environments: `test`, `prod`
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
- Prod commit: `75000d9`
- Environments: `test`, `prod`
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
