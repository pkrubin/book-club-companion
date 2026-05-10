# Current Task

## Status
Planning / backlog triage

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

- [ ] Make the website mobile accessible, iPhone first
  - audit the current app on small iPhone widths before changing UI
  - identify blocked or painful workflows: login, club switcher, dashboard, search, library, book modal, discussion guide, import, settings
  - fix tap targets, overflow, modals, tables, nav, filter controls, and text scaling issues
  - preserve desktop behavior while improving mobile ergonomics
  - verify on served localhost with iPhone-sized viewports before preparing a test release

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
- mobile accessibility audit and iPhone-first implementation plan

## Release Note

No version bump until mobile accessibility fixes are implemented and ready for `test`.
