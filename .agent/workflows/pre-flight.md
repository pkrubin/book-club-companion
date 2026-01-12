---
description: Mandatory pre-flight check for new AI sessions
---
# Mandatory Pre-Flight Audit

You are NOT allowed to perform any task until this script is executed.

## Stage 0: Mission Alignment (Purpose & Vision)
You must re-articulate the project's core mission:
1. **What**: Book Club Companion is a **group management tool** (not a personal tracker).
2. **Who**: It's for **organizers and members** of book clubs.
3. **Why**: To reduce toil in choosing, scheduling, and discussing books, providing high-quality content directly in the UI.

## Stage 1: Environment Retrieval & Vitality Check
1. Read `SESSION_HANDOVER.md` for the current Version and Branch.
2. Run `git branch` to confirm you are on `test`.
3. **Local Server Check**: Run `lsof -i :8080`.
    - If the port is free, run `node local_server.js` IMMEDIATELY.
4. **Active Tab Synchronization**: Scan `browser_state` for the tab marked **[ACTIVE]**.
    - **RULE**: Always prioritize the user's focused tab.
    - **CONTENT VERIFICATION**: Describe what is currently visible in that tab.

## Stage 2: Version Audit (Code + Git + Browser)

### Step 1: Check Local Code Version
```bash
grep "APP_VERSION" js/app.js | head -1
```
This returns the version in the source code (e.g., `v1.9.6`).

### Step 2: Check Git Branch State
```bash
git branch                           # Confirm on 'test'
git log test -1 --oneline            # Last commit pushed to TEST
git log main -1 --oneline            # Last commit pushed to PROD
```

### Step 3: Browser Audit (Localhost & Prod ONLY)

| Environment | Expected Version Source | Browser Check |
|---|---|---|
| **Localhost** | `js/app.js` | Check footer. Should match local code. |
| **Production** | `git log main -1` | Check footer. If mismatch, **refresh page** and re-check. |
| **Test** | `git log test -1` | **DO NOT NAVIGATE.** Report version from git only. |

#### Stale Tab Detection (PROD):
1. Extract expected version from git: `git log main -1 --oneline`
2. Check browser footer version.
3. **If mismatch**: Refresh the page (F5) and check again.
4. **If still mismatch**: Report discrepancy—deployment may be pending or failed.

> **CRITICAL**: Never open the TEST URL (`book-club-companion-git-test-...`). It will redirect to Vercel login.

### Stage 3: Operational Vows (Confirm Selection)
1.  **Verify Before Push**: After code edits, I will STOP and ask the user to verify on localhost before any git commands.
2.  **Privacy Priority**: I will never attempt to log in or guess credentials.
3.  **Adaptive Navigation**: I will reuse existing tabs and describe the visible UI to confirm focus.
4.  **Incremental Progress**: I will make small, one-at-a-time changes.
5. **English Only**: All system metadata, task names, and logs will be English-only.
6. **Absolute Paths**: I will use absolute paths for every tool call.

## Stage 4: Readiness
State your understanding of the user's current goal and wait for acknowledgment.

**Response Format:**
"Audit Complete.
- Mission: [Articulate What/Who/Why].
- State: [Version] on [Branch].
- Vitality: Local Server [Running/Started].
- Audit: Local [vX.X.X] | Prod [vX.X.X] | Test [vX.X.X or PROTECTED].
- **Active Tab**: [Title] | **Snapshot**: [Describe visible UI state].
- Vows: [List Vows]."
