# 🚨 AI SESSION QUICK START - READ THIS FIRST

> ⛔ **STOP!** Before doing ANYTHING, read this entire file. It's short.

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

## How We Work Together

**The Golden Rule: Human logs in, AI tests afterward.**

- You CANNOT log in (you don't have credentials)
- You CANNOT navigate to new URLs (breaks session)
- You CAN click buttons, take screenshots, check console AFTER human logs in

### Agent-Assisted Testing Protocol
1. Ensure `node local_server.js` is running (check terminal or ask user)
2. Ask user: "Please open localhost:8080 and log in"
3. Wait for: "I am logged in"
4. Then YOU can: capture screenshots, click buttons, check console, navigate tabs
5. NEVER give up just because you can't log in yourself

---

## The 3 Environments (CRITICAL)

When user says... | They mean... | URL
------------------|--------------|----
**"localhost"** | Local dev server | `http://localhost:8080`
**"test"** | TEST branch/site | `book-club-companion-git-test-pam-rubins-projects.vercel.app`
**"prod"** or **"production"** | MAIN branch/live | `book-club-companion.vercel.app`

### The Flow: localhost → test → prod

```
[LOCALHOST] → [TEST] → [PROD]
   Code        Staging   Live
   changes     verify    deploy
```

### Git Branches (IMPORTANT)
- **`main`** branch = PRODUCTION (live site) - **PROTECTED, never work here directly**
- **`test`** branch = Development + staging
- **ALWAYS work on `test` branch, NEVER on `main`**

### Deployment Workflow (MANDATORY)

**Step 0:** Run `git branch` to confirm you're on `test`
```bash
git checkout test   # If not already on test
```

**Step 1-5: Local Development (on test branch)**
1. Make changes locally
2. Test on localhost:8080 (ensure server is running!)
3. **⚠️ BUMP VERSION** (REQUIRED before ANY deployment):
   - Edit `js/app.js` line 3: `const APP_VERSION = 'X.X.X'`
   - Edit `package.json`: `"version": "X.X.X"`
4. Commit with version in message:
   ```bash
   git add . && git commit -m "v1.X.X: Description"
   ```
5. Push to TEST:
   ```bash
   git push origin test
   ```

**Step 6: STOP AND WAIT**
- Tell user: "Deployed to TEST (v1.X.X). Please verify."
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
- User IDs or passwords (ask human)
- Column names (check schema.sql)
- API endpoints (verify they exist)

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

**DON'T keep trying. ASK.**

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

- Always run `git branch` before any git operation
- Project root: `/Users/pamrubin/Desktop/book-club/`
- Always use ABSOLUTE paths in tool calls

---

## First Message Requirement

At the START of every new conversation:
1. Read this file
2. Say: "I've read README_FOR_AI.md and understand the rules"
3. Ask: "What would you like to work on?"

DO NOT start coding until you've confirmed understanding.

---

## Where to Find More

- `project_guidelines.md` - Detailed rules and lessons learned
- `DEPLOYMENT_GUIDE.md` - Full deployment instructions  
- `CHANGELOG.md` - Historical changes
- `schema.sql` - Database structure
