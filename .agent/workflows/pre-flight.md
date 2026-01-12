---
description: Mandatory pre-flight check for new AI sessions
---
# Mandatory Pre-Flight Audit

You are NOT allowed to perform any task until this script is executed.

## Stage 0: Mission Alignment (Purpose & Vision)
You must re-articulate the project's core mission to ensure alignment:
1. **What:** Book Club Companion is a **group management tool** (not a personal tracker).
2. **Who:** It's for **organizers and members** of book clubs.
3. **Why:** To reduce toil in choosing, scheduling, and discussing books, providing high-quality content (questions/ratings) directly in the UI.

## Stage 1: State Retrieval
1. Read `SESSION_HANDOVER.md` for the current Version (v1.9.6) and Branch (`test`).
2. Run `git branch` to confirm you are on `test`.

## Stage 2: Version Audit (Live Check)
You must check the footer of these 3 URLs and report their versions:
1. **Localhost:** `http://localhost:8080` (Verify logic server is running)
2. **Test Site:** `https://book-club-companion-git-test-pam-rubins-projects.vercel.app/`
3. **Prod Site:** `https://book-club-companion.vercel.app/`
*Note: Report any version drift immediately.*

## Stage 3: Safety Protocol Vows
You must verbally confirm the following:
1. **The 10-Second Stop:** I will pause after every code edit for manual user verification.
2. **Login Rule:** Human logs in, AI tests. I will NEVER attempt to log in or enter credentials.
3. **English Only:** All system metadata, task names, and logs will be English-only. No Chinese tokens.
4. **Absolute Paths:** I will use absolute paths for every tool call.

## Stage 4: Readiness
State your understanding of the user's current goal and wait for acknowledgment.

**Response Format:**
"Audit Complete.
- Mission: [Articulate What/Who/Why].
- State: v1.9.6 on `test` branch.
- Audit: Local [v1.X.X] | Test [v1.X.X] | Prod [v1.X.X]
- Vows: 10-Second Stop (Active) | Login Rule (Accepted) | English-Only (Enforced).
Ready to proceed with [Goal]."
