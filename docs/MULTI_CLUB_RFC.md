# Multi-Club Architecture RFC

## Status
- Draft architecture RFC
- Documentation only
- No runtime behavior change

## Why This Exists

The app currently behaves like one shared club with one shared library, one shared scheduling surface, and legacy global role assumptions. That has been workable for a single live club, but it is the wrong shape for:

- multiple real clubs in one app
- per-club admin/member roles
- a safe sandbox club for testing
- club-specific backlogs and schedules
- trustworthy rollout and rollback discipline for shared Supabase changes

This RFC defines the target architecture before implementation begins.

## Product Model

- One shared app with a club switcher
- Users work in one active club at a time
- The Library is always club-specific
- Most members will only ever see their own club's library
- Users with multiple clubs get a manual club switcher
- Club admins can switch among clubs they belong to
- A rare platform owner can browse and manage across clubs

## Roles

### Club-scoped roles
Stored in `club_memberships.role`:

- `member`
- `admin`

Club admins are local to the clubs they belong to. They are not automatically global admins.

### Platform-scoped role
Stored in `platform_roles.role`:

- `owner`

Platform owners may:

- browse all clubs
- manage memberships and club admins
- create and archive clubs
- manage club invites
- access and manage sandbox clubs

## Data Model

### `clubs`
Purpose: club identity and lifecycle

- `id`
- `name`
- `slug`
- `description`
- `club_type`
- `is_archived`
- `created_at`
- `created_by`

`club_type` values:

- `standard`
- `sandbox`

### `club_settings`
Purpose: small, intentional club-specific configuration

- `club_id`
- `default_meeting_time`
- `default_timezone`
- `logo_url`
- `accent_color`
- `theme_token`

Initial scope is intentionally small:

- schedule defaults
- light branding

Future policy settings may be added later, but v1 should not become an unbounded settings blob.

### `club_memberships`
Purpose: many-to-many user ↔ club relationship

- `club_id`
- `user_id`
- `role`
- `status`
- `joined_at`

This allows:

- admin in Club A
- member in Club B
- no visibility into Club C without membership

### `platform_roles`
Purpose: rare cross-club management layer

- `user_id`
- `role`

Initial role:

- `owner`

### `club_invites`
Purpose: club-specific onboarding and membership growth

- `id`
- `club_id`
- `code`
- `role_to_grant`
- `valid_from`
- `valid_until`
- `max_uses`
- `current_uses`
- `created_by`
- `created_at`

### `user_preferences`
Purpose: user-controlled settings, not role or membership

- `user_id`
- `active_club_id`
- future notification preferences
- future visual preferences

## Existing Tables That Become Club-Scoped

Add `club_id` to:

- `book_club_list`
- `schedule_changes`

That makes these club-owned instead of app-global:

- library/backlog books
- statuses
- schedules
- discussion guides
- notifications
- exports and imports

## Library Behavior

The Library is always club-specific.

Rules:

- every library query is filtered by `activeClubId`
- tags, filters, exports, ratings, host/date/time, and discussion guides are club-scoped
- members with one club do not need a visible switcher
- users with multiple clubs get a manual switcher
- club admins can switch among clubs they belong to
- owners can browse across clubs

Operationally:

- most people will simply see their own club's library
- admins can switch which club backlog/library they are viewing

## Book Dedupe Rule

Within one club:

- no duplicate copies of the same book should be created
- save/import flows should merge or reject duplicates within that club

Across different clubs:

- the same title is allowed to exist independently
- those club-specific copies may have different status, host, date, notes, tags, and discussion guide content

## Invite Model

Existing invite codes should be migrated into club-specific invites rather than discarded.

Rules:

- future invites belong to one club only
- consuming one invite grants access only to that club
- the same user may later consume another invite for another club

This replaces the current app-global invite behavior with a club-scoped access model.

## Sandbox Strategy

Sandbox clubs are real isolated clubs, not a special mode.

Rules:

- owners can create sandbox clubs
- sandbox clubs may include selected testers
- sandbox data never leaks into live clubs
- sandbox exports only contain sandbox data
- sandbox notifications are club-scoped like any other club

During migration:

- `Test` status remains temporarily for compatibility
- `Test` status should be retired after sandbox clubs are live and verified

Long-term testing model:

- use sandbox clubs, not `Test` books mixed into the live club

## Membership Edge Cases

- User with one club: sees that club and does not need a real switcher
- User with multiple clubs: uses a manual switcher
- User removed from active club: fall back to another active club if available
- User with no active clubs: show a no-club state with clear next steps

## Current Architecture Constraints

Today:

- the app still behaves like one active shared club
- the library is effectively global
- `Test` status is a temporary workaround, not the long-term testing model
- `user_profiles.role` is a legacy authorization source and should not remain the long-term auth model

## Rollout Order

### Phase 1: Finish current hardening first
1. Land release audit trail docs and `RELEASE_LOG.md`
2. Harden notification rendering and trusted `schedule_changes`
3. Harden invites with trusted consumption

### Phase 2: Add club schema without changing behavior yet
1. Add:
   - `clubs`
   - `club_settings`
   - `club_memberships`
   - `platform_roles`
   - `club_invites`
   - `user_preferences`
2. Add `club_id` to:
   - `book_club_list`
   - `schedule_changes`
3. Seed the current live club as the first `standard` club
4. Backfill existing books and schedule changes into that club
5. Create memberships for current users
6. Set `active_club_id`

### Phase 3: Switch app behavior to club-scoped queries
1. Replace global role assumptions with:
   - `currentMembershipRole`
   - `activeClubId`
   - `activeClubType`
2. Scope all book, notification, invite, export, and scheduling queries by `activeClubId`
3. Add the club switcher
4. Add club-local member management and invites

### Phase 4: Add sandbox club UX and retire `Test`
1. Add sandbox club creation for owners
2. Validate sandbox-scoped testing workflow
3. Retire `Test` as a long-term workaround

## Rollback Boundary

The "harder to undo" point is when club-scoped app behavior goes live.

Adding support tables and backfilling club IDs is still a relatively manageable migration step. Once the UI and application queries depend on `activeClubId`, rollback becomes significantly more complex and must be treated with extra caution.

## Environment and Deployment Discipline

For any DB-backed work:

1. Start from fresh `origin/test` in a new worktree
2. Make backward-compatible app changes first
3. Bump the app version in `js/app.js` and `package.json`
4. Push to `test`
5. Verify on `test`
6. Apply shared Supabase SQL with forward and rollback scripts
7. Verify again immediately
8. Promote `test` to `main` right away
9. Record the rollout in `RELEASE_LOG.md`

Important repo note:

- there is no `AGENTS.md` in this repo
- the operative agent/deployment instructions live in `README_FOR_AI.md` and `DEPLOYMENT_GUIDE.md`
