# 🚨 AI SESSION QUICK START - READ THIS FIRST

> ⛔ **STOP!** Before doing ANYTHING, you MUST run the `/pre-flight` workflow.
> 1. Type: `/pre-flight`
> 2. Confirm your understanding of the rules.
> 3. **DO NOT run any other tools** until pre-flight is complete.

## 📋 Session Handover (READ FIRST!)

**Read `SESSION_HANDOVER.md` immediately** - it contains:
- Current version and recent deployments
- What was worked on in recent sessions
- Known issues and in-progress items
- Database state and design decisions
- What NOT to change without asking

> **At END of every session:** Update SESSION_HANDOVER.md with what was accomplished in the session.

---

## What Is This App?

**Book Club Companion** is a **book club management tool** (NOT a personal tracker like Goodreads).

### Purpose & Vision

**Phase 1 (Current - Admin Tools):**
- Simplify the administrator's work to import, tag, and rate books
- Make book selection and scheduling easier
- Dashboard, Library, Search, Discussion Guides ✅ Built

**Phase 2 (Future - Member Features):**
- Members log in and see books on schedule
- Download discussion guides
- Add meetings to calendar
- Suggest books (saved as "Proposed")

**Phase 3 (Future - Full Admin):**
- Import/export functionality
- Set schedules
- Manage members (add, remove, align to clubs)
- Multi-book-club support
- Create/delete book clubs

### What This Is NOT
- ❌ NOT a personal book tracker (like Goodreads)
- ❌ NOT a reading journal
- ✅ IS a book CLUB management tool for GROUPS

---

## ⭐ The Three Golden Rules

### Golden Rule of Development
**Safety first. Small incremental changes. One thing at a time.**
- DEV = localhost:8080 (where you make and test changes)
- Make ONE small change
- Test it immediately on DEV
- Only then proceed to the next change
- Never make massive changes all at once
- Log significant changes in `CHANGELOG.md`

**Detailed best practices** (silent failure avoidance, no hardcoding, logging, etc.):
→ See `project_guidelines.md` "Development Protocols & Lessons Learned" section

### Golden Rule of Testing
**Human logs in, AI tests afterward. Localhost first, then promote.**
- **DATA SAFETY**: If a test involves changing data (Update, Delete, Create), use ONLY books with the status **'Test'**. Never modify production data (e.g., 'Scheduled', 'Saved' books) for testing.
- **AUDIT LOGS**: Maintain a session audit log for ALL data changes performed (as an artifact or in the walkthrough).
- **EXPLICIT CLEANUP**: Every test plan must include specific instructions for cleaning up test data at the end.
- **THE 10-SECOND STOP (MANDATORY)**: Never combine code edits and git commands (add, commit, push) in the same turn. You MUST pause after editing and ask the user to verify on localhost first.
- **THE ACTIVE TAB PROTOCOL**: Always prioritize the tab currently focused by the user (marked `[ACTIVE]` in `browser_state`). Re-use this tab whenever possible to stay within the Human's authenticated session.
- **CONTENT SIGNALING (MANDATORY)**: You MUST describe the visible UI of your selected tab (e.g., "I see the Dashboard with one book scheduled for April"). This ensures you and the user are looking at the same thing.
- **HARD STOP: REDIRECT DETECTION**: If navigation redirects to any page other than our app UI (e.g., Vercel Login, SSO, GitHub, Supabase), **STOP IMMEDIATELY**. Report "ENVIRONMENT PROTECTED" and wait for user guidance. Do not attempt to "find the footer" or audit a protected page.
- Test on localhost FIRST.
- Only push to TEST when localhost works AND the user gives explicit "Localhost verified" approval.
- User verifies TEST before production.
- Never skip verification steps.

### Golden Rule of Deployment
**DEV → TEST → PROD. Never skip a step. Always get approval.**
- DEV = localhost:8080 (local development)
- TEST = `test` branch pushed to GitHub (staging site)
- PROD = `main` branch pushed to GitHub (live site)
- Work on `test` branch, never `main`
- Get explicit user approval before PROD

---

## How We Work Together

**The Testing Golden Rule: Human logs in, AI tests afterward.**

- You CANNOT log in (you don't have credentials)
- You CANNOT navigate to new URLs (breaks session)
- You CAN click buttons, take screenshots, check console AFTER human logs in

### Agent-Assisted Testing Protocol
1. Ensure `node local_server.js` is running (check terminal or ask user)
2. Ask user: "Please open localhost:8080 and log in"
3. Wait for: "I am logged in"
4. Then YOU can: capture screenshots, click buttons, check console, navigate tabs.
5. Reuse existing tabs: Always scan `browser_state` first. Prioritize the `[ACTIVE]` tab if it matches the target environment. Opening redundant tabs is prohibited.

---

## The 3 Environments (CRITICAL)

When user says... | They mean... | URL
------------------|--------------|----
**"localhost"** | Local dev server | `http://localhost:8080`
**"test"** | TEST branch/site | `book-club-companion-git-test-pam-rubins-projects.vercel.app`
**"prod"** or **"production"** | MAIN branch/live | `book-club-companion.vercel.app`

### The Flow: localhost → test → prod

```
[LOCALHOST]    →    [TEST]    →    [PROD]
  Develop           Verify         Deploy
  & test            on remote      to live
  locally           site
```

### Git Branches (IMPORTANT)
- **`main`** branch = PRODUCTION (live site) - **PROTECTED, never work here directly**
- **`test`** branch = Development branch (pushes to TEST site for verification)
- **ALWAYS work on `test` branch locally, NEVER on `main`**

### Deployment Workflow (MANDATORY)

**Step 0:** Run `git branch` to confirm you're on `test`
```bash
git checkout test   # If not already on test
```

**Step 1-2: Develop & Test LOCALLY First**
1. Make code changes locally
2. Test on localhost:8080 (ensure server is running!)
   - Repeat until localhost works correctly

**Step 3-5: When Localhost is Good → Push to TEST**
3. **⚠️ BUMP VERSION** (REQUIRED before ANY deployment):
   - Edit `js/app.js` line 3: `const APP_VERSION = 'X.X.X'`
   - Edit `package.json`: `"version": "X.X.X"`
4. Commit with version in message:
   ```bash
   git add . && git commit -m "v1.X.X: Description"
   ```
5. Push to TEST site:
   ```bash
   git push origin test
   ```

**Step 6: STOP AND WAIT**
- Tell user: "Deployed to TEST (v1.X.X). Please verify at [TEST URL]."
- User checks footer version matches
- Wait for user confirmation
- DO NOT proceed without explicit approval

**Step 7: Deploy to PROD (only after approval)**
```bash
git checkout main
git merge test
git push origin main
git checkout test   # Return to test for next work
```

> ⚠️ **If footer shows old version**, deployment failed. Debug before proceeding.

---

## The Planning Rule

**Before ANY code change:**
1. Understand the request
2. Identify affected files
3. Write a plan (or describe it)
4. Get user approval
5. THEN execute

**Massive changes = NEVER. Small incremental changes = ALWAYS.**

---

## Backup Before Major Changes

Before any large refactor:
1. Create: `Backups/YYYYMMDD_HHMMSS_description/`
2. Copy: index.html, app.js, styles.css
3. Add README.md explaining purpose

---

## Common Mistakes to Avoid

### Zero Fabrication Rule
**NEVER make up:**
- Variable names (READ the code first)
- User IDs or passwords (ask human - DO NOT ATTEMPT TO LOG IN)
- Column names (check schema.sql)
- API endpoints (verify they exist)

### Environment Visibility & The Redirect Stop
- If a URL (like TEST or PROD) redirects to a platform login (Vercel, SSO, etc.):
- **YOU ARE NOT ALLOWED TO PROCEED**.
- Do NOT click "Login", "Sign In", or "Continue".
- Do NOT attempt to "find the version in the footer" if the app itself isn't visible.
- Report "Environment Protected" and wait for the user.

### Code Hygiene
- View file AFTER editing to verify brackets match
- Include leading whitespace EXACTLY in edits
- Don't make 5 edits fixing your own typos

### CSS/UI Protocol
1. View current HTML structure FIRST
2. Check if Tailwind class exists (this project uses Tailwind)
3. Make ONE small change
4. Ask user to verify visually
5. Iterate

### Debugging Protocol
1. Check browser console for errors (ask user for screenshot)
2. Add ONE console.log at a time
3. Test IMMEDIATELY after each change
4. If stuck 3 times, STOP and ask user

---

## Token Efficiency

- **View only what you need** - Use line ranges, not entire 5000-line files
- **Don't re-read** - Remember what you've seen
- **Edit once, correctly** - Triple-check before editing
- **Brevity in communication** - Bullet points > paragraphs

---

## Stop Conditions

**STOP and ask the user if:**
1. You've tried the same approach 3 times
2. You're unsure what they meant
3. You're about to delete/overwrite something
4. You're about to change more than 50 lines
5. Human says "wait", "stop", "not yet"

**HOW to stop gracefully:**
- Finish current atomic operation (don't leave partial edits)
- Commit any completed work to avoid losing progress
- Summarize current state: "I've done X, Y is pending"
- Ask for direction before continuing

**DON'T keep trying. DON'T leave things half-done. ASK.**

---

## Architecture Quick Reference

```
project/
├── index.html        # Single-page app, all UI
├── js/app.js         # Large file (~4700 lines), main logic
├── css/styles.css    # Custom styles + Tailwind
├── api/gemini.js     # AI endpoint (serverless)
├── local_server.js   # Dev server proxy
├── schema.sql        # Database schema
└── *.md              # Documentation
```

**Key Info:**
- Current version: Check `js/app.js` line 3 for `APP_VERSION`
- Tailwind CSS (CDN, pinned to 3.4.1)
- Supabase (PostgreSQL) for database
- Backend changes require server restart (`Ctrl+C` then `node local_server.js`)

---

## Git Protocol

- **Default branch:** `test` (for development)
- **Protected branch:** `main` (production only)
- Always run `git branch` before any git operation to confirm you're on `test`
- Project root: `/Users/pamrubin/Desktop/book-club/`
- Always use ABSOLUTE paths in tool calls

**Quick reference:**
```bash
git checkout test        # Switch to dev branch
git branch               # Verify current branch
git push origin test     # Deploy to TEST site
git checkout main && git merge test && git push origin main  # Deploy to PROD (after approval)
```

---

## First Message Requirement

At the START of every new conversation:
1. Read this file
2. Say: "I've read README_FOR_AI.md and understand the rules"
3. Ask: "What would you like to work on?"

DO NOT start coding until you've confirmed understanding.

---

## Where to Find More

- `SESSION_HANDOVER.md` - **Read first!** Current state and recent work
- `FEATURES.md` - Complete feature inventory by page
- `project_guidelines.md` - Detailed rules and lessons learned
- `DEPLOYMENT_GUIDE.md` - Full deployment instructions  
- `CHANGELOG.md` - Historical changes
- `schema.sql` - Database structure
