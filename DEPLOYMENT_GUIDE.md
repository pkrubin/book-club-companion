# 🚀 AI Site Maintenance & Deployment Guide

> **Canonical repo instructions now live in `AGENTS.md`. Use this guide as deployment-specific detail.**

This guide is optimized for AI agents to maintain and deploy the Book Club Companion application.

## 🏁 Phase 1: Core Logistics

- **GitHub Repository**: [https://github.com/pkrubin/book-club-companion](https://github.com/pkrubin/book-club-companion)
- **Local Dev Root**: `/Users/pamrubin/Desktop/book-club/`

### Required Environment Variables
- `GEMINI_API_KEY`: Used by `api/gemini.js` for AI tagging/discussion features.
- `GOOGLE_BOOKS_API_KEY`: Used by `api/books.js` for Find Books and import search.
  - Backward-compatible fallbacks exist (`GOOGLE_API_KEY`, `BOOKS_API_KEY`, `GEMINI_API_KEY`) but `GOOGLE_BOOKS_API_KEY` is the preferred name.

## 🕹️ Phase 2: Local Server Management

The AI must ensure the local server is running before attempting any verification.

### Direct Navigation Rule
Always use these exact URLs directly. **NEVER** navigate via the Vercel Dashboard or intermediate links.
- **DEV**: `http://localhost:8080`
- **TEST**: `https://book-club-companion-git-test-pam-rubins-projects.vercel.app/`
- **PROD**: `https://book-club-companion.vercel.app/`

### Server Vitality Check
1. **Check Process**: Run `lsof -i :8080`.
2. **If Port is Occupied**: Assume server is running.
3. **If Port is Free**: Run `node local_server.js` from the project root.
4. **Backend Restart Rule**: If you modify ANY file in `api/` or `local_server.js`, you MUST kill (`Ctrl+C`) and restart (`node local_server.js`) the server to apply changes.

## 🚥 Phase 3: The Golden Path (Deployment Workflow)

### 🛑 STAGE 1: Local Development & Verification
1.  **Work Locally**: Make small, incremental code changes.
2.  **Verify on Localhost**: Open `http://localhost:8080`.
3.  **Validate All Changes**: Check links, buttons, and layout at **100% zoom**.
4.  **STOP & ASK**: Tell the user: *"Local changes complete. Please verify on localhost:8080. If it looks correct, let me know and I will proceed to TEST."*

> [!IMPORTANT]
> **DO NOT proceed** to TEST until the user gives explicit approval.

### 🚥 STAGE 2: Preparation & Test Site Deployment
*Only proceed here after Stage 1 is verified by the human.*

5.  **Bump Version (REQUIRED)**:
    - Update `APP_VERSION` in `js/app.js` (Line 3).
    - Update `"version"` in `package.json`.
6.  **Switch to Branch**: Always use the `test` branch for development work.
    ```bash
    git checkout test
    ```
7.  **Commit & Push**:
    ```bash
    git add .
    git commit -m "v1.X.X: [Description]"
    git push origin test
    ```
8.  **Update `RELEASE_LOG.md` (REQUIRED)**:
    - Add one release entry with the version, test commit SHA, user-facing changes, env/config changes, and manual SQL notes.
    - If the version did not change, say so explicitly.
9.  **Stage 2.8: Environment Visibility Audit**
    - **Direct Navigation**: Navigate directly to the Test URL.
    - **Redirect? STOP**: If the resulting page is **ANYTHING** other than our app UI (e.g., Vercel Login, SSO page):
        - **DO NOT** attempt to log in.
        - **DO NOT** try to find a version number on the redirect page.
        - **STOP IMMEDIATELY**, report "ENVIRONMENT PROTECTED," and wait for the user.
    - **App Visible?**: If our app UI loads (showing the login form or dashboard):
        - Verify the version number in the footer.
        - Report: "TEST Site Accessible | Version X.X.X identified."
    - **Coordination**: If functional testing is needed, tell the user: *"TEST branch deployed. Environment is protected/accessible. Please log in for functional verification."*

### 🚀 STAGE 3: Production Deployment
*Only proceed here after explicit user approval of the TEST site.*

10.  **Promote to Main**:
    ```bash
    git checkout main
    git merge test
    git push origin main
    git checkout test   # Return to test for next task
    ```
11. **Update `RELEASE_LOG.md` for PROD**:
    - Fill in the production commit SHA.
    - Record whether the release included manual Supabase SQL, environment-variable changes, or rollback notes.

## 🛡️ AI Site Resilience & Safety

### The Wall of Stop
AI Agents are strictly prohibited from accessing:
- **Vercel Dashboard** (`vercel.com/dashboard`)
- **Supabase Dashboard** (`supabase.com/dashboard`)
- **GitHub Repository Settings**
- **Any Page requiring AI login**

### AI Resilience Strategy
The app uses a Smart Fallback Chain for Gemini models to ensure stability (managed in `api/gemini.js`).

### Verify Before Push
Never combine code edits and git commands in the same turn. Pause after editing and ask for localhost verification.
