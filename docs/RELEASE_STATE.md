# Release State

Snapshot taken on 2026-05-09 after successful promotion of the reconciled `v1.9.15` line to production.

## Canonical Snapshot

- Prod source of truth: `origin/main`
- Prod commit: `75000d934c5cdd787be942817403021adcf54e0a`
- Prod app version: `v1.9.15`
- Test source of truth: `origin/test`
- Test app line: `v1.9.15` plus docs-only updates after promotion
- Pre-promotion prod baseline: `8fcbaff1e5842ab0e4e513c418ee4d049dd267b5`
- Shared-risk condition: `test` and `prod` continue to use the same Supabase database

## Current Release Posture

- Prod and test are now aligned on the multi-club release line.
- The earlier `v1.9.10` prod versus `v1.9.15` test shared-database mismatch has been resolved.
- `origin/main` contains the production promotion merge commit.
- `origin/test` contains the same app behavior plus subsequent docs-only reconciliation work.

## What Is In Prod

Confirmed on the promoted `v1.9.15` line:

- `v1.9.11`
  - Multi-club app awareness
  - Club switcher and sandbox-club workflows
  - Club-scoped reads/writes through live `club_id` filtering
- `v1.9.12`
  - Search waits for auth hydration and retries the first `401`
- `v1.9.13`
  - Search refreshes the Supabase session after `401`
  - Search surfaces the underlying API error message
- `v1.9.14`
  - Google Books proxy retries transient upstream `502` / `503` / `504` failures
- `v1.9.15`
  - Library `Refresh` button removed

## What Is In Test But Not Prod

- No known user-facing app behavior is present on `origin/test` but missing from `origin/main`.
- The remaining difference is Git history, not runtime behavior:
  - `origin/main` has the production merge commit `75000d9`
  - `origin/test` carries post-promotion docs reconciliation commits on top of the same `v1.9.15` app behavior

## What Is Started But Unreleased

Historical `codex/*` branches still exist, but they should not be treated as canonical release sources.

Examples:
- `codex/app-club-awareness`
- `codex/app-club-awareness-testprep`
- `codex/multi-club-foundation`
- `codex/multi-club-rfc`
- `codex/schedule-changes-hardening`
- `codex/user-profiles-rollout-20260502`

Interpretation:
- These branches are useful historical context only.
- New work should begin from a fresh worktree based on current `origin/test`, not from an older side branch.

## Release Log Status

- `RELEASE_LOG.md` now records:
  - the actual `v1.9.15` test commit `eb28e2a`
  - the shared production promotion commit `75000d9` for `v1.9.11` through `v1.9.15`
- `SESSION_HANDOVER.md` and `AGENTS.md` should remain in sync with that reality after future promotions.

## Rollback Reference

- Saved pre-promotion prod baseline:
  - `8fcbaff1e5842ab0e4e513c418ee4d049dd267b5`
- Production promotion merge:
  - `75000d934c5cdd787be942817403021adcf54e0a`

Important caveat:
- Emergency code rollback to the old prod baseline would reintroduce the earlier shared-database mismatch and should only be used if the promoted state is clearly worse than the pre-promotion state.

## Recommended Working Rules From Here

1. Start all new work from a fresh worktree based on `origin/test`.
2. Treat multi-club and sandbox-club behavior as live reality, not future design.
3. Update `RELEASE_LOG.md`, `SESSION_HANDOVER.md`, and `AGENTS.md` promptly whenever a release changes operational reality.
4. Do not rely on stale local checkouts or historical `codex/*` branches as the release source of truth.
