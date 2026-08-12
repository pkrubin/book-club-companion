# Current Task

## Status
Release alignment and production readiness review in progress

## Usage

- This is the active multi-session task memory for the repo.
- Read it when resuming work after a chat switch or when several tasks are competing for attention.
- Keep it short and operational.
- Update it when the active goal, the next step, or the main risks change materially.
- Check off completed items instead of leaving them mixed into the open queue.
- Keep this file as the actionable tracker.
- Keep `docs/PRODUCT_SCOPE.md` higher-level and non-duplicative.

## Big Goal

Reconcile the `v1.9.45` test release with production before starting unrelated defect or feature work.

## Default Start Point
- Start new work from fresh `origin/test`
- Use `$book-club-workflow`

## Active Queue

- [ ] Reconcile the pending test release train
  - [x] confirm `test` is `v1.9.40` and production is `v1.9.15`
  - [x] identify missing release WIP limits and unsynchronized branch ancestry as the process failures
  - [x] add a deterministic release-alignment check and workflow stop gates
  - [x] merge existing production history back into the test line without changing application files
  - [x] fix and locally verify the authenticated header collision shown in the production member smoke test
  - [x] verify the `v1.9.41` header on hosted `test` at the reported standard-window width
  - [x] complete a focused authenticated hosted `test` smoke pass for dashboard, club switcher, search, library, book modal, guide, import, settings, and iPhone modal layout
  - [x] verify the `v1.9.42` club-switcher open-state overflow fix on hosted `test`
  - [x] decide whether the currently saved `Demon Copperhead` guide quality is a release blocker or a data/content cleanup item
    - decision: treat as a release-blocking generator quality issue; saved guide text is not changed unless an admin regenerates it
  - [x] verify `v1.9.43` discussion-guide prompt/lint improvement on hosted `test`
    - review found remaining issues: quoted dedication/epigraph references were not preserved, opening quote question appeared too late, final question was weak, and output leaned too heavily toward character questions
  - [x] verify `v1.9.44` precise quote, ordering, and plot/turning-point guide refinement on hosted `test`
    - review was much better; remaining issues were source attribution embedded in question text and a conditional outside-reading final question
  - [ ] verify `v1.9.45` source-attribution, ending-question, and severe-quality save-blocking guardrails on hosted `test`
  - [ ] complete any remaining member-specific smoke check if Pam wants a non-admin account verified
  - [ ] make an explicit promote-or-defer decision
  - [ ] after any production promotion, synchronize `main` history back into `test`

- [ ] Improve AI discussion guide question quality
  - [x] review current AI discussion prompt
  - [x] identify why current output feels school-like and multi-part
  - [x] update prompt for smart, conversational, character-and-choice-centered questions
  - [x] add strict accuracy rules for quotes, scenes, plot events, and specific facts
  - [x] allow admins to open/test guides for saved books before scheduling
  - [x] refine prompt to avoid metadata/speculation language and ask readers to supply book examples
  - [x] verify generated guide quality on hosted `test`
    - `The Secret Book Society` regenerated on `v1.9.27`; output improved, with fewer speculative prompts and stronger character/choice framing
    - remaining issue: model still used "mentioned in the description" once, so add generation lint/retry or post-generation guardrails before relying on prompt-only rules
  - [x] add first pass source anchors and generation lint/retry for more dynamic, book-specific questions
    - `The Secret Book Society` now has verified guide anchors from author/reader-guide sources without copying official questions
    - prompt now requires a mix of character/choice, specific-moment, idea, and passage-centered questions
    - output lint asks the model to retry if it uses source-packaging language, overuses speculation, lacks passage/scene questions, or returns too many multi-part questions
  - [x] tighten output lint after `v1.9.28` review to reject compound follow-ups and school-style vocabulary
  - [x] block saving AI guide drafts that still fail quality checks after retry
  - [x] preserve existing visible guide when a generated draft fails quality checks
  - [x] reverse engineer official author-guide question style for `The Secret Book Society`
    - official/citeable questions should be used directly when available
    - generated fallback should target author-guide patterns: concrete book anchors, reader judgment, personal connection, and natural follow-ups
    - linting should allow strong conversational follow-ups like "Why or why not?" while still rejecting generic or worksheet-like drafts
  - [x] add official-guide import path for `The Secret Book Society`
    - regenerate loads official author questions with source instead of asking AI to imitate them
    - fallback AI lint rejects intros, speculative phrasing, and source-packaging language observed in `v1.9.32`
  - [x] verify official `The Secret Book Society` guide loads on hosted `test` with source attribution
  - [x] strip guide intro chatter like "Here are 12 discussion questions..." before display/save
  - [x] add automated search-grounded guide generation path
    - Gemini searches for official/citeable book-club questions before generating fallback questions
    - source links from grounding metadata are attached when available
    - admin-provided source material remains a future last-resort override, not the default path
  - [x] fix quality gate so minor warnings do not produce an error-only guide modal
  - [x] add fallback source label when Gemini grounding links are unavailable
  - [x] remove model attribution as the visible source for generated guides
  - [x] prevent empty or too-short AI drafts from overwriting saved guide text
  - [x] refine prompt/lint for multiple discussion lanes, multiple characters, secondary characters, less school-like openings, and better host-style flow
  - [x] review generated `Demon Copperhead` guide on hosted `test` and capture follow-up issues
  - [x] preserve generated-guide double quotes and add rules for exact dedication/epigraph/quote handling
  - [x] add ordering guardrails for opening-material and final questions
  - [x] expand prompt beyond character questions into plot movement, turning points, consequences, setting, and social forces
  - [x] add source-attribution-in-question and conditional-ending guardrails
  - [x] block saving drafts that still have severe quote/source/order/style issues after retries
  - [ ] regenerate and review one safe test guide on hosted `test` before production promotion
  - [ ] design source-grounded reader-guide/snippet workflow for admins who want richer context
    - candidate sources: author/publisher guide, Google Books metadata/snippets, trusted book-club guides, admin-pasted notes
    - output should use verified facts/quotes only, summarize source inspiration, and avoid copying guide questions wholesale
    - phase 1: add a no-save preview flow so admins can test a generated guide before replacing the shared guide
    - phase 2: gather source context from Google Books metadata plus admin-pasted notes or URLs, with clear source labels
    - phase 3: prefer author/publisher reader guides when discoverable, but use them as inspiration/anchors rather than copying questions
    - phase 4: pass the model a compact "verified context" block with names, relationships, settings, conflicts, exact quotes if supplied, and citation/source labels
    - phase 5: show admins a short "Used these sources" note and require confirmation before saving regenerated shared guide text

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
  - [x] verify all seven flagged public tables now have RLS enabled in `pg_tables`
  - [x] verify Pam admin access on hosted `test` and `prod`
  - [ ] verify member access, club switcher, dashboard, search, library, book modal, discussion guide, import, settings, and create-sandbox-club
  - [x] rerun Supabase Security Advisor and confirm the seven RLS warnings clear

- [ ] Plan and phase remaining Supabase Security Advisor warnings
  - [x] review exported Supabase warning CSV
  - [x] group warnings by root cause and risk
  - [x] create phased warning hardening plan in `docs/SUPABASE_WARNING_HARDENING_PLAN.md`
  - [ ] Phase 1: enable leaked password protection after configuring an email provider
  - [x] Phase 2: remove GraphQL exposure if unused and verify REST app flows; Advisor warnings dropped from 44 to 20
  - [ ] Phase 3: restrict direct `SECURITY DEFINER` function execution with rollback
  - [ ] Phase 4: replace broad `book_club_list` write policies with club-scoped policies
  - [ ] Phase 5: replace browser-side `invite_codes` updates with trusted invite consumption

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
  - [x] fix tablet/small-window header overlap around 641-900px widths
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
- complete the focused `v1.9.40` smoke test, then either promote it or record the specific blocker; do not start unrelated work first

## Release Note

Security hardening SQL has been applied to the shared Supabase database in phased chunks; all seven flagged public tables report `rowsecurity = true`, Supabase Security Advisor has cleared, and Pam admin smoke passed on hosted `test` and `prod`.
