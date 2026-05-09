# Release State

Snapshot taken on 2026-05-09 from a fresh worktree based on `origin/test` at `eb28e2a`.

## Canonical Snapshot

- Prod source of truth: `origin/main`
- Prod app version: `v1.9.10`
- Test source of truth: `origin/test`
- Test app version: `v1.9.15`
- Shared-risk condition: `test` and `prod` use the same Supabase database

## Important Investigation Updates

- The fresh `origin/test` worktree did not contain `docs/RELEASE_STATE.md`; this file is being added now as canonical bookkeeping.
- `RELEASE_LOG.md` already contained entries for `v1.9.11` through `v1.9.14`.
- The `v1.9.15` release entry was incomplete. Its actual test-branch release-prep commit is `eb28e2a`.
- `SESSION_HANDOVER.md` is stale for release status. It still says `1.9.10` is on both `test` and `prod`.
- There is a documentation contradiction that needs human awareness:
  - `RELEASE_LOG.md` says `v1.9.11` relies on a previously applied multi-club foundation schema.
  - `AGENTS.md` describes the multi-club tables and `club_id` columns as planned and not live by default.

## Unreleased Commit Inventory

Commits on `origin/test` not on `origin/main`: `12`

### 1. `a1a389c` - `v1.9.11: add multi-club app awareness for sandbox testing`

- Version: `v1.9.11`
- Files changed:
  - `AGENTS.md`
  - `DEPLOYMENT_GUIDE.md`
  - `RELEASE_LOG.md`
  - `SESSION_HANDOVER.md`
  - `css/styles.css`
  - `index.html`
  - `js/app.js`
  - `package.json`
- DB/schema/RLS assumptions:
  - Yes.
  - App code begins using `clubs`, `club_settings`, `club_memberships`, and `user_preferences`.
  - App code assumes `book_club_list.club_id` and `schedule_changes.club_id` exist and filters many reads/writes through `applyActiveClubFilter(...)`.
  - The release log says no SQL shipped in this commit, but it relies on earlier multi-club foundation DB work already being present.
- Shared DB prod-safety impact:
  - High.
  - This is the key prod/test mismatch commit.
  - If the shared database contains sandbox clubs or club-scoped rows, prod `v1.9.10` does not understand that model.
- Appears safe to promote to prod:
  - No, not yet.
  - The release log explicitly says it was intended for lower-environment sandbox validation only.
  - Real API validation was deferred to `test`.

### 2. `b29d51a` - `docs: record pending multi-club test release metadata`

- Version: `unchanged`
- Files changed:
  - `RELEASE_LOG.md`
  - `SESSION_HANDOVER.md`
- DB/schema/RLS assumptions:
  - Inherits the `v1.9.11` assumption that the foundation schema exists.
- Shared DB prod-safety impact:
  - None by itself.
- Appears safe to promote to prod:
  - Bookkeeping only, but not useful alone.

### 3. `ac2f656` - `docs: correct test release commit reference`

- Version: `unchanged`
- Files changed:
  - `RELEASE_LOG.md`
- DB/schema/RLS assumptions:
  - No new ones.
- Shared DB prod-safety impact:
  - None by itself.
- Appears safe to promote to prod:
  - Yes as docs, but it does not address runtime risk.

### 4. `5c65dd8` - `docs: streamline README against canonical AGENTS guide`

- Version: `unchanged`
- Files changed:
  - `README_FOR_AI.md`
- DB/schema/RLS assumptions:
  - No new runtime assumptions.
- Shared DB prod-safety impact:
  - None.
- Appears safe to promote to prod:
  - Yes as docs.

### 5. `c44b157` - `v1.9.12: fix sandbox first-search auth timing`

- Version: `v1.9.12`
- Files changed:
  - `RELEASE_LOG.md`
  - `js/app.js`
  - `package.json`
- DB/schema/RLS assumptions:
  - No new schema or RLS assumptions.
  - Depends on the `v1.9.11` app structure because it patches that tree's auth/search flow.
- Shared DB prod-safety impact:
  - Low direct DB risk.
  - Does not solve the club-scoping mismatch.
- Appears safe to promote to prod:
  - Probably safe in isolation conceptually, but not sufficient and not obviously worth cherry-picking alone.

### 6. `f029c62` - `docs: record v1.9.12 test commit in release log`

- Version: `unchanged`
- Files changed:
  - `RELEASE_LOG.md`
- DB/schema/RLS assumptions:
  - No new ones.
- Shared DB prod-safety impact:
  - None.
- Appears safe to promote to prod:
  - Yes as docs.

### 7. `db84901` - `v1.9.13: refresh auth before sandbox search retry`

- Version: `v1.9.13`
- Files changed:
  - `RELEASE_LOG.md`
  - `js/app.js`
  - `package.json`
- DB/schema/RLS assumptions:
  - No new schema or RLS assumptions.
  - Changes client auth/session refresh behavior for protected search requests.
- Shared DB prod-safety impact:
  - Low direct DB risk.
  - Still does not address the club-model mismatch.
- Appears safe to promote to prod:
  - Probably safe in isolation conceptually, but still not the fix for the live data-confusion problem.

### 8. `7d83f46` - `docs: record v1.9.13 test commit in release log`

- Version: `unchanged`
- Files changed:
  - `RELEASE_LOG.md`
- DB/schema/RLS assumptions:
  - No new ones.
- Shared DB prod-safety impact:
  - None.
- Appears safe to promote to prod:
  - Yes as docs.

### 9. `872400c` - `v1.9.14: retry transient Google Books failures`

- Version: `v1.9.14`
- Files changed:
  - `RELEASE_LOG.md`
  - `api/books.js`
  - `js/app.js`
  - `package.json`
- DB/schema/RLS assumptions:
  - No DB or RLS changes.
  - Adds transient retry/backoff for upstream Google Books `502/503/504` failures.
- Shared DB prod-safety impact:
  - None directly.
- Appears safe to promote to prod:
  - Yes conceptually.
  - If selective promotion is chosen later, this is one of the clearest low-risk candidates.

### 10. `78919fb` - `docs: record v1.9.14 test commit in release log`

- Version: `unchanged`
- Files changed:
  - `RELEASE_LOG.md`
- DB/schema/RLS assumptions:
  - No new ones.
- Shared DB prod-safety impact:
  - None.
- Appears safe to promote to prod:
  - Yes as docs.

### 11. `47f7dcb` - `Remove library refresh button`

- Version: feature change only; version bump happened in the next commit
- Files changed:
  - `index.html`
  - `js/app.js`
- DB/schema/RLS assumptions:
  - No new ones.
- Shared DB prod-safety impact:
  - None directly.
- Appears safe to promote to prod:
  - Probably yes technically, but it is unrelated to the live prod-safety problem.

### 12. `eb28e2a` - `Prepare v1.9.15 test release`

- Version: `v1.9.15`
- Files changed:
  - `RELEASE_LOG.md`
  - `js/app.js`
  - `package.json`
- DB/schema/RLS assumptions:
  - No new ones.
  - This is the release-prep commit that bumps the version markers to `1.9.15` and adds the release-log entry.
- Shared DB prod-safety impact:
  - None directly.
- Appears safe to promote to prod:
  - Safe as bookkeeping, but meaningful only together with `47f7dcb`.

## What Matters Most For Prod Safety

- The only unreleased commit with major shared-database risk is `a1a389c` (`v1.9.11` multi-club app awareness).
- The later `v1.9.12` through `v1.9.15` commits are mostly search hardening, proxy retry logic, docs, and a small library UI cleanup.
- Promoting all of `origin/test` would align prod with the club-aware app code, but that move is not yet justified by the evidence because:
  - `v1.9.11` was explicitly described as lower-environment sandbox validation only
  - test validation was deferred
  - docs disagree about whether the multi-club foundation should be treated as live

## Recommendation

Recommended path: `D. create a hotfix branch for prod`

Why:

- `A` is too risky.
  - Promoting all of `origin/test` would push the unproven `v1.9.11` multi-club rollout to prod.
- `B` does not solve the urgent prod-confusion issue.
  - Cherry-picking only the clearly safe search/proxy/UI commits would still leave prod on the wrong data model relative to the shared database.
- `C` is too blunt without first confirming live shared-database usage.
  - A broad rollback of multi-club DB assumptions could break current test workflows and may not be necessary if the real issue is sandbox data presence rather than schema alone.
- `D` gives the cleanest safety-first path.
  - Branch from `origin/main`
  - investigate and fix the live prod exposure issue specifically
  - keep the multi-club test line separate until it is explicitly validated for promotion

## Suggested Next Human Decisions

1. Confirm whether the shared DB currently contains sandbox clubs and sandbox-linked `book_club_list` rows visible to prod users.
2. Decide whether the immediate prod hotfix should be:
   - data cleanup / sandbox isolation in the shared DB, or
   - a minimal prod-side guard branch
3. Keep `origin/test` as the canonical investigation branch for multi-club work, but do not promote it wholesale until `v1.9.11` is explicitly re-validated for prod.
