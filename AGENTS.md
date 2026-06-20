# AGENTS.md

Canonical repo instructions for Book Club Companion.

If any other repo doc conflicts with this file, follow `AGENTS.md`.

## What This App Is

Book Club Companion is a multi-club book club management tool.

Current live reality:
- multi-club is live in both `test` and `prod`
- sandbox clubs are available for testing
- `test` and `prod` share one Supabase database
- members and admins use the same app with role-based UI restrictions

## Read These Docs Only

Read in this order:
1. `AGENTS.md`
2. `RELEASE_LOG.md`
3. `docs/PRODUCT_SCOPE.md`

For multi-session feature work or when resuming after a chat switch:
4. `docs/CURRENT_TASK.md`

Repo-local workflow skill:
- `.codex/skills/book-club-workflow`
- If the runtime discovers repo-local skills, use it for routine Book Club Companion work.
- To guarantee use, invoke it explicitly as `$book-club-workflow`.

Read only when relevant:
- `docs/MULTI_CLUB_RFC.md` for architecture context
- `docs/RELEASE_STATE.md` for release recovery or incident context

Treat these as archived/legacy context, not primary instructions:
- `README_FOR_AI.md`
- `DEPLOYMENT_GUIDE.md`
- `FEATURES.md`
- `CHANGELOG.md`
- `SESSION_HANDOVER.md`
- `project_guidelines.md`

## Non-Negotiable Rules

1. Safety first.
   - Make small, reversible changes.
   - Do not bundle unrelated work.
   - Do not make destructive changes without explicit approval.

2. Humans log in, AI tests afterward.
   - Never invent or use credentials.
   - If auth is required, wait for the human to log in first.

3. DEV -> TEST -> PROD.
   - Work locally first.
   - Push to `test` before `main`.
   - Never skip staging.

4. Keep one Git-backed source of truth.
   - Start from fresh `origin/test` for normal feature work.
   - Use one branch/worktree per task when practical.
   - Do not rely on stale local checkouts or detached preview folders.

5. No meaningful release without version + release log.
   - Bump `js/app.js`
   - Bump `package.json`
   - Update `RELEASE_LOG.md`

6. Limit release work in progress.
   - Fetch and run `.codex/skills/book-club-workflow/scripts/check-release-alignment.sh` before choosing new work.
   - If `test` is ahead of production, finish its validation and make a promote-or-defer decision before unrelated work.
   - Three unpromoted test versions or seven days without a decision is a release incident; stop adding scope and reconcile.

## Environment Map

- `localhost`: local dev server, usually `http://localhost:8080`
- `test`: `https://book-club-companion-git-test-pam-rubins-projects.vercel.app/`
- `prod`: `https://book-club-companion.vercel.app/`

Branch policy:
- `test` = development/staging
- `main` = production

## Standard Workflow

1. Fetch `origin` and run the release-alignment check.
2. Resolve any pending promotion or branch divergence before unrelated feature work.
3. Start from fresh `origin/test` in a new worktree.
4. Define the change briefly:
   - goal
   - affected files
   - DB changes: yes or no
   - validation plan
   - rollback plan
5. Implement locally.
6. Test on a served app, not `file://`.
7. Ask for human verification when the change needs authenticated or visual confirmation.

For work likely to span multiple chats:
8. Keep `docs/CURRENT_TASK.md` current with:
   - active goal
   - the real next step
   - major open risks or decisions
   - completed items checked off
9. Keep it short and operational, not narrative.

## Release Workflow

When preparing to push to `test`:
1. Confirm localhost behavior.
2. Bump version in:
   - `js/app.js`
   - `package.json`
3. Add or update one `RELEASE_LOG.md` entry with:
   - version
   - test commit
   - user-facing changes
   - DB/config changes
   - validation notes
   - rollback note
4. Commit and push to `test`.
5. Do not begin unrelated work until the candidate is promoted or explicitly deferred in `docs/CURRENT_TASK.md`.

When promoting to `main`:
1. Verify `test` first.
2. Preserve a rollback anchor for the current `main` state.
3. Merge `test` to `main`.
4. Update the same `RELEASE_LOG.md` entry with the prod commit.
5. Verify prod.
6. Synchronize the resulting `main` history back into `test` and verify `origin/main` is an ancestor of `origin/test`.

## Shared Database Caution

`test` and `prod` share one Supabase database.

That means:
- schema, RLS, and policy changes affect both environments
- app/data model mismatches between `test` and `prod` are dangerous
- after shared DB changes, promote `test` to `main` promptly
- when debugging cross-environment issues, consider DB state first

## Data Safety

If testing can change real data:
- prefer sandbox clubs first
- within a club, prefer books with status `Test`
- do not casually modify important live `Scheduled` books
- include cleanup instructions for test data

## Redirect Rule

If navigation to `test` or `prod` redirects to any non-app page:
- stop immediately
- report `ENVIRONMENT PROTECTED`
- do not click through auth walls

## Current Live Database Usage

The live app code currently depends on these club-aware tables/columns:
- `public.clubs`
- `public.club_settings`
- `public.club_memberships`
- `public.user_preferences`
- `public.book_club_list.club_id`
- `public.schedule_changes.club_id`

Do not describe these as merely planned unless you are intentionally documenting historical context.

## Doc Update Rule

When a release changes operational reality, update:
- `RELEASE_LOG.md`
- `AGENTS.md` if workflow or live architecture assumptions changed
- `docs/PRODUCT_SCOPE.md` if current capabilities changed

When active feature priorities or next steps change across sessions, update:
- `docs/CURRENT_TASK.md`

`docs/CURRENT_TASK.md` is the task tracker.
`docs/PRODUCT_SCOPE.md` is the high-level product/state doc.
Do not duplicate detailed actionable backlog in both places.

Avoid reviving long narrative handoff documents unless there is a real incident.

## When In Doubt

1. Stop making assumptions.
2. Check `git` state and `RELEASE_LOG.md`.
3. Read the smallest relevant code/doc slice.
4. Choose the smaller safer change.
