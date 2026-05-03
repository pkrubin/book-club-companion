# AGENTS.md

This is the canonical repo-level instruction file for AI/code agents working on Book Club Companion.

If any other repo doc conflicts with this file, follow `AGENTS.md` first, then use the other docs as supporting detail.

## What This App Is

Book Club Companion is a **book club management tool**, not a personal reading tracker.

Current product shape:
- single live club in production
- member/admin workflows
- shared Supabase database across `test` and `prod`

Future direction:
- multi-book-club support
- per-club memberships/roles
- sandbox club for testing

## Canonical Supporting Docs

After reading this file, the next most useful repo docs are:
- `SESSION_HANDOVER.md`
- `README_FOR_AI.md`
- `DEPLOYMENT_GUIDE.md`
- `RELEASE_LOG.md`

## Non-Negotiable Rules

### 1. Safety first
- make small, incremental changes
- do not bundle unrelated changes
- do not make destructive changes without explicit approval

### 2. Humans log in, AI tests afterward
- never attempt to log in as the user
- never use or invent credentials
- if a flow requires authentication, the human logs in first

### 3. DEV -> TEST -> PROD
- develop locally first
- verify locally first
- push to `test` before `main`
- never skip the staging step

### 4. No deployment without version + release log
For every meaningful deployment to `test` or `prod`, you must:
- bump version in both:
  - `js/app.js`
  - `package.json`
- add/update an entry in `RELEASE_LOG.md`

Hard stop:
- do not push to `test` or `main` if the code changed and you did not decide whether the version changes
- do not promote to `prod` without updating `RELEASE_LOG.md`

### 5. Shared database changes require extra discipline
`test` and `prod` share the same Supabase database.

That means:
- DB permission/schema/policy changes affect both environments
- backward-compatible app code should land before shared DB tightening
- after a shared DB change, promote `test` to `main` promptly so the environments stay aligned

### 6. Never trust stale local branch state
For DB-backed or deployment work:
- start from fresh `origin/test`
- prefer a fresh worktree/branch over an old local checkout

### 7. Move finished worktrees to cleanup instead of deleting immediately
- active worktrees may stay in normal working locations
- when a branch/worktree is no longer active, move its worktree into the cleanup holding area instead of deleting it immediately
- use the cleanup area to separate active work from historical scaffolding
- only delete branches or worktrees after an explicit cleanup decision

## Standard Change Workflow

Use this as the default delivery loop for any meaningful code, deployment, or DB-backed change.

### 1. Define first
Before implementation, write a short change brief that covers:
- goal
- affected files
- DB changes: yes or no
- rollout order
- validation plan
- rollback plan

Do not start implementation until the change shape is clear.

### 2. Branch once from fresh `origin/test`
- create one fresh worktree/branch from current `origin/test`
- prefer one task = one branch = one worktree
- avoid helper or transplant branches unless there is a specific operational reason

### 3. Keep code and ops together
When a change is real enough to ship, the same branch should include:
- code changes
- forward SQL and rollback SQL if needed
- version bump in `js/app.js`
- version bump in `package.json`
- `RELEASE_LOG.md` update
- doc updates if the workflow or architecture changed

The branch should tell the whole story.

### 4. Push to `test` only when release-ready
Before pushing to `test`, confirm:
- localhost work is validated
- version decision is made and recorded
- `RELEASE_LOG.md` is updated
- SQL files exist if DB changes are involved

Do not push partially prepared rollout branches to `test`.

### 5. Use the shared DB sequence for DB-backed changes
For shared-database changes:
1. ship backward-compatible app code to `test`
2. verify `test`
3. apply shared Supabase SQL
4. verify again immediately
5. promote `test` to `main` right away

This is the default pattern unless there is a clear reason to do otherwise.

### 6. Close the loop immediately
After promotion:
- update `RELEASE_LOG.md` with the production commit and any final notes
- move the finished worktree to the cleanup area if it is no longer active
- make an explicit keep/delete-later decision for the branch

Do not leave deployment bookkeeping half-finished.

## Environment Map

- `localhost`: local dev server, usually `http://localhost:8080`
- `test`: remote staging site from the `test` branch
- `prod`: live site from the `main` branch

Current branch policy:
- `test` = development/staging branch
- `main` = production branch

## Required Deployment Flow

### Local
1. make the smallest useful change
2. test locally
3. ask for/obtain human verification when appropriate

### Test
Before pushing to `test`:
1. bump `js/app.js` version
2. bump `package.json` version
3. update `RELEASE_LOG.md`
4. commit
5. push to `test`

After pushing to `test`:
1. verify the site/version
2. have the human verify functional behavior

### Production
Before promoting to `main`:
1. ensure `test` is verified
2. ensure shared DB steps, if any, are documented
3. update `RELEASE_LOG.md` with the production commit/notes

## Redirect / Protected Environment Rule

If navigation to `test` or `prod` redirects to:
- Vercel login
- SSO
- GitHub auth
- Supabase auth
- any other non-app page

Stop immediately and report:
- `ENVIRONMENT PROTECTED`

Do not click through auth walls.

## Data Safety Rules

If testing changes real data:
- prefer books with status `Test` until sandbox clubs exist
- never casually modify important live `Scheduled` books
- always include cleanup instructions for test data

## Current Operational Realities

- `RELEASE_LOG.md` is now required, not optional
- version bumps have been missed in the past; watch this carefully
- `user_profiles.role` is legacy and should not remain the long-term auth source
- the app is moving toward club-scoped data and a sandbox-club model

## When in Doubt

If unsure:
1. stop making assumptions
2. read `SESSION_HANDOVER.md`
3. inspect the actual code/database-facing logic
4. choose the smaller safer change
