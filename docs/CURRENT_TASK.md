# Current Task

## Status
Mobile accessibility implementation in progress

## Usage

- This is the active multi-session task memory for the repo.
- Read it when resuming work after a chat switch or when several tasks are competing for attention.
- Keep it short and operational.
- Update it when the active goal, the next step, or the main risks change materially.
- Check off completed items instead of leaving them mixed into the open queue.
- Keep this file as the actionable tracker.
- Keep `docs/PRODUCT_SCOPE.md` higher-level and non-duplicative.

## Big Goal

Make Book Club Companion usable and accessible on phones and tablets while continuing the multi-club architecture work.

## Default Start Point
- Start new work from fresh `origin/test`
- Use `$book-club-workflow`

## Active Queue

- [ ] Harden Supabase public-table RLS
  - [x] inspect Supabase Security Advisor warning for `rls_disabled_in_public`
  - [x] map flagged tables to current app access patterns
  - [x] draft reviewed forward SQL in `public_rls_hardening.sql`
  - [x] draft emergency rollback SQL in `public_rls_hardening_rollback.sql`
  - [x] create phased rollout plan in `docs/RLS_HARDENING_PLAN.md`
  - [x] create read-only preflight checks in `public_rls_preflight_checks.sql`
  - [x] confirm SQL against live table column types in Supabase SQL editor
  - [x] confirm no users/preferences/clubs would be hidden by membership-based RLS
  - [x] apply SQL during a focused maintenance window
  - [x] verify Pam admin access on hosted `test` and `prod`
  - [ ] verify member access, club switcher, dashboard, search, library, book modal, discussion guide, import, settings, and create-sandbox-club
  - [ ] rerun Supabase Security Advisor and confirm the seven RLS warnings clear

- [ ] Make the website mobile accessible, iPhone first
  - [x] start from a fresh `origin/test` worktree on `codex/mobile-a11y`
  - [x] audit the unauthenticated app on a 390px iPhone-sized viewport before changing UI
  - [x] implement first safe mobile pass for login spacing, nav wrapping, search controls, library filters, table/card overflow, modal sizing, tap targets, menu state, and Escape handling
  - [x] fix unauthenticated app-content bleed caused by mismatched nav markup and weak hidden-state enforcement
  - [x] verify served localhost loads at iPhone and tablet widths with no console errors
  - [x] use real iPhone screenshots from `test` to identify layout issues in authenticated Dashboard, Find Books, and Library
  - [x] implement phone-first correction for compact header/nav, compact dashboard hero, separated search controls, and a mobile library filter sheet
  - [x] verify `v1.9.17` on hosted `test` from iPhone and capture remaining book-detail density issues
  - [x] tighten the mobile book detail modal by demoting external links, shrinking tags, and pairing edit fields
  - [x] reuse the existing app icon for iPhone/iPad home-screen setup metadata
  - [x] fix mobile target-date clear icon overlap in the book detail modal
  - [x] replace redundant dashboard detail button with Calendar and Guide actions
  - [x] tighten the mobile book detail modal action stack into a compact cover/action header
  - [x] move mobile modal rating under the cover and hide the lower-priority Library link on phone
  - [x] fix the mobile Target Date / Meeting Time row overflow
  - [x] redesign the mobile book modal header around cover, rating, Guide, and two secondary links
  - [x] stack the mobile Target Date / Meeting Time row to prevent native iOS date overflow
  - [ ] verify `v1.9.23` on hosted `test` from iPhone/iPad
  - [ ] fix any remaining authenticated iPhone findings before considering prod promotion

- [ ] Extend mobile accessibility work to iPad/tablet layouts
  - audit portrait and landscape tablet widths after iPhone fixes are stable
  - tune layouts for medium-width density instead of simply stretching phone UI
  - verify dashboard, library table/grid, modals, import review, and discussion guide flows

- [ ] Define and implement the multi-club role model
  - add a per-club `manager` role
  - define permissions split among `member`, `manager`, and current club-admin behavior

- [ ] Add club-scoped member management workflows
  - managers should be able to add, update, and remove members only in clubs they manage
  - decide whether manager is distinct from current club admin or a rename/re-scope

- [ ] Add super-admin / platform-owner workflow
  - cross-club visibility
  - club and member administration across the system
  - confirm naming and final power boundary during implementation

- [ ] Implement metadata reuse to reduce API churn
  - reuse stored ratings and tags when equivalent book metadata already exists
  - decide matching strategy: Google Books ID, ISBN, title/author, or fallback order

- [ ] Verify and address the invite code race condition
  - confirm whether it still exists in the current live flow
  - fold findings into invite/lifecycle work

- [ ] Tag quality cleanup
  - fix incorrect `"New York"` tagging
  - review garbage-tag cleanup and deletion edge cases

- [ ] Decide whether to retire `Test` status
  - confirm whether sandbox clubs are now sufficient to replace mixed live-club testing

## Future Queue

- [ ] Security hardening
- [ ] UI optimization / cleanup
- [ ] Discussion guide refinement
- [ ] Admin import / export improvements
- [ ] Continue documentation simplification without reintroducing large overlapping handoff docs

## Not Yet Confirmed As Active Build Work

These exist in historical docs or RFCs but should not be treated as the next feature automatically:
- `user_profiles` VIEW approach for future email/phone expansion
- broader club invite architecture beyond immediate product needs

## Suggested Next Decision

Next recommended task:
- rerun Supabase Security Advisor, then finish member/admin smoke tests for RLS hardening

## Release Note

Security hardening SQL has been applied to the shared Supabase database; Pam admin smoke passed on hosted `test` and `prod`.
