---
name: book-club-workflow
description: Use when working in the Book Club Companion repo on feature delivery, release preparation, staging verification, production promotion, release alignment, or release reconciliation. This skill provides the canonical workflow for checking test/prod drift, limiting work in progress, building from fresh origin/test, testing safely with the shared database, maintaining RELEASE_LOG.md, and keeping branches and docs aligned with live reality.
---

# Book Club Workflow

Use this skill for routine work in the Book Club Companion repo.

## Read First

Read in this order:
1. `AGENTS.md`
2. `RELEASE_LOG.md`
3. `docs/PRODUCT_SCOPE.md`

For multi-session or resumed work:
4. `docs/CURRENT_TASK.md`

Only read additional docs if the task specifically needs them.

## Core Rules

- Fetch `origin`, then run `bash .codex/skills/book-club-workflow/scripts/check-release-alignment.sh` before choosing work.
- If `test` is pending promotion, do not start unrelated feature work. Finish validation, promote, or explicitly defer it with the reason recorded in `docs/CURRENT_TASK.md`.
- Treat three unpromoted test versions or seven days without a promote/defer decision as a release incident. Make release reconciliation the top task and stop adding scope.
- Start normal work from fresh `origin/test` in a new worktree.
- Treat `test` and `prod` as sharing one Supabase database.
- Prefer sandbox clubs first for testing data-changing behavior.
- Do not bump versions during ordinary development.
- Bump versions only when preparing a meaningful push to `test`.
- For each meaningful release, update one `RELEASE_LOG.md` entry rather than scattering status across multiple docs.

## Default Delivery Loop

1. Fetch `origin`, run the repo-local alignment script, and inspect git state.
2. If alignment reports `PENDING_PROMOTION` or `DIVERGED`, resolve the release decision before unrelated work.
3. Define the change briefly:
   - goal
   - files
   - DB changes: yes or no
   - validation plan
   - rollback plan
4. Implement locally.
5. Test on a served app, not `file://`.
6. If auth is needed, wait for the human to log in first.
7. Pause for human verification when the change is visually important or authenticated.
8. Keep `docs/CURRENT_TASK.md` in sync for multi-session work:
   - move the active task to the top
   - update the real next step
   - check off completed items
   - remove or downgrade stale items when they are no longer actionable

## Preparing A Test Release

Do this only when localhost work is ready:

1. Update `js/app.js` version.
2. Update `package.json` version.
3. Add or update one `RELEASE_LOG.md` entry with:
   - version
   - test commit
   - user-facing changes
   - DB/config changes
   - validation notes
   - rollback note
4. Commit and push to `test`.
5. Have the human verify `test`.
6. Record the real next action as `promote`, `fix blocking defect`, or `defer with reason`.

Do not create a chain of unrelated test releases. Corrections required for the current candidate may continue, but unrelated work waits until the release decision is closed.

## Promoting To Prod

1. Confirm `test` is the intended release line.
2. Preserve a rollback anchor for current `main`.
3. Merge `test` to `main`.
4. Update the same `RELEASE_LOG.md` entry with the prod commit.
5. Verify prod.
6. Fast-forward or merge the resulting `main` history back into `test`, push `test`, and rerun the alignment script.

The promotion is not complete until production is verified and `origin/main` is an ancestor of `origin/test`.

Preferred recovery after prod issues:
- hotfix forward first

Emergency-only recovery:
- revert the prod merge using the saved rollback anchor

## Minimal Active Docs

Treat these as the active docs:
- `AGENTS.md`
- `RELEASE_LOG.md`
- `docs/PRODUCT_SCOPE.md`
- `docs/CURRENT_TASK.md` for active multi-session task memory

Treat these as retired or incident-only unless explicitly needed:
- `README_FOR_AI.md`
- `DEPLOYMENT_GUIDE.md`
- `FEATURES.md`
- `SESSION_HANDOVER.md`
- `CHANGELOG.md`
- `project_guidelines.md`
- `docs/RELEASE_STATE.md`

## When To Update Docs

Update docs only when operational reality changes:
- `AGENTS.md` for workflow/live architecture assumptions
- `docs/PRODUCT_SCOPE.md` for current capabilities
- `RELEASE_LOG.md` for releases

Update `docs/CURRENT_TASK.md` when:
- the main goal changes
- the next step changes materially
- a task is being handed across chats
- a meaningful subtask is completed
- priorities are reordered

Keep `docs/CURRENT_TASK.md` short and operational.
Treat it as the task tracker, not as another product doc.

Avoid reviving long narrative status docs for routine work.
