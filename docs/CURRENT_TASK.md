# Current Task

## Status
Planning / backlog triage

## Usage

- This is the active multi-session task memory for the repo.
- Read it when resuming work after a chat switch or when several tasks are competing for attention.
- Keep it short and operational.
- Update it when the active goal, the next step, or the main risks change materially.

## Big Goal

Finish the multi-club architecture so the live app has a complete club-management model, lower API churn, and a clearer admin surface.

## Default Start Point
- Start new work from fresh `origin/test`
- Use `$book-club-workflow`

## Confirmed Leftover Work

These items are supported by the current repo docs and archived handoff:

1. Complete multi-club role model
   - Source: user clarification in current chat
   - Source: `docs/PRODUCT_SCOPE.md`
   - Source: `docs/MULTI_CLUB_RFC.md`
   - Notes:
     - add a per-club `manager` role
     - keep per-club membership management separate from platform-wide power
     - define the exact permissions split among `member`, `manager`, and existing club-level admin behaviors

2. Add club-scoped member management UI and workflows
   - Source: user clarification in current chat
   - Source: `docs/PRODUCT_SCOPE.md`
   - Source: `docs/MULTI_CLUB_RFC.md`
   - Notes:
     - club managers should be able to add, update, and remove members only in clubs they manage
     - clarify whether club admins and club managers are distinct roles or whether manager replaces part of the current club-admin surface

3. Add super-admin / platform-owner workflow
   - Source: user clarification in current chat
   - Source: `docs/MULTI_CLUB_RFC.md`
   - Notes:
     - this role needs cross-club visibility
     - this role should be able to administer clubs, members, and broader system state
     - this likely aligns with the RFC's platform-owner concept, but naming and exact powers need confirmation during implementation

4. API optimization through metadata reuse
   - Source: user clarification in current chat
   - Notes:
     - reuse stored metadata such as ratings and tags when the same book is added to another club
     - reduce Goodreads and other API churn when equivalent metadata already exists elsewhere in the shared dataset
     - decide what counts as the same book for reuse: title/author match, Google Books ID, ISBN, or a ranked fallback

5. Invite and club lifecycle tooling
   - Source: `docs/PRODUCT_SCOPE.md`
   - Source: `docs/MULTI_CLUB_RFC.md`
   - Notes:
     - current app has invite-based sign-up, but the RFC still calls for fuller club-scoped invite flows and club lifecycle controls
     - verify whether the old invite code race condition is still present before redesigning the flow

6. Tag quality cleanup
   - Source: `docs/PRODUCT_SCOPE.md`
   - Source: `archive/SESSION_HANDOVER.pre-streamline-20260509.md`
   - Notes:
     - fix rule-based tagging issue where `"New York"` can be added incorrectly
     - review possible garbage-tag cleanup / deletion edge cases

7. Decide whether to retire `Test` status
   - Source: `docs/MULTI_CLUB_RFC.md`
   - Notes: RFC says sandbox clubs should replace mixed live-club `Test` workflows after verification

8. Future work explicitly called out by user
   - Source: user clarification in current chat
   - Notes:
     - security hardening
     - UI optimization / cleanup
     - discussion guide refinement
     - admin import / export

9. Continue documentation simplification
   - Source: `docs/PRODUCT_SCOPE.md`
   - Notes: current simplification is in good shape, but future work should avoid reintroducing large overlapping handoff docs

## Not Yet Confirmed As Active Build Work

These exist in historical docs or RFCs but should not be treated as the next feature automatically:
- `user_profiles` VIEW approach for future email/phone expansion
- broader club invite architecture beyond immediate product needs

## Suggested Next Decision

Choose the next real product task from:
1. define and implement the `manager` role
2. define and implement the super-admin / platform-owner surface
3. implement metadata reuse to cut API churn
4. verify and address invite race-condition risk
5. tag quality cleanup

## Release Note

No version bump until a real feature or fix is ready for `test`.
