# How to Deploy Your App (Step-by-Step)

> [!CAUTION]
> ## ⛔ STOP! READ THIS FIRST ⛔
> **NEVER deploy directly to Production (`main` branch).**
> 
> You MUST:
> 1. Deploy to **TEST** branch first
> 2. Verify the TEST site works correctly
> 3. Get **explicit user permission** before deploying to Production
> 
> **Failure to follow this workflow risks breaking the live site.**

---

Great news! Your code is now safely stored on GitHub.
**Link:** [https://github.com/pkrubin/book-club-companion](https://github.com/pkrubin/book-club-companion)

Now you can turn it into a live website using Vercel.

## Phase 2: Local Development (Server Protocol)

While developing locally, remember:
*   **Frontend (HTML/JS/CSS):** Updates automatically when you refresh the page.
*   **Backend (local_server.js, api/*.js):** **Does NOT update automatically.**
*   **The Rule:** If you change any file in the `api/` folder or `local_server.js`, you MUST:
    1.  Go to the terminal where the server is running.
    2.  Press `Ctrl + C` to stop it.
    3.  Type `node local_server.js` to start it again.

## Phase 3: Go Live with Vercel

1.  **Go to Vercel:** Visit [https://vercel.com](https://vercel.com) and click **"Sign Up"**.
2.  **Connect GitHub:** Choose **"Continue with GitHub"**. It will ask for permission to see your repositories. Click **Authorize**.
3.  **Import Project:**
    *   Once logged in, you will see a button labeled **"Add New..."** -> **"Project"**.
    *   You will see a list of your GitHub repositories.
    *   Find `book-club-companion` and click **"Import"**.
    *   Find `book-club-companion` and click **"Import"**.

4.  **Configure Secrets (Critical for AI):**
    *   On the "Configure Project" screen, look for **"Environment Variables"**.
    *   Add a new variable:
        *   **Key:** `GEMINI_API_KEY`
        *   **Value:** (Paste your Gemini API Key here - the one from `.env.local`)
    *   *Note: Supabase keys are safe in your code, but the AI key must be hidden here.*

5.  **Deploy:**
    *   Click the big blue **"Deploy"** button.
5.  **Wait 30 Seconds:** Vercel will build your site. Formatting... Optimizing...
6.  **Done!** You will see a "Congratulations!" screen with a screenshot of your app. Click the screenshot to visit your live URL (something like `book-club-companion.vercel.app`).

---

### How to Update in the Future?
Because we linked them, updating is automatic!
1.  You (or the AI) make changes to the code on your computer.
2.  To save them, simply ask the AI: *"Push my changes to GitHub."*
3.  Vercel sees the change on GitHub and **automatically updates the live site** within seconds.

### AI Resilience Strategy
To ensure the AI works reliably despite "Rate Limits" on experimental models, the app uses a **Smart Fallback Chain**:
1.  **Gemini 3.0 Pro** (Best Quality)
2.  **Gemini 3.0 Flash** (High Speed)
3.  **Gemini 2.0 Flash** (Experimental)
4.  **Gemini 1.5 Flash** (Stable Backup)

If one fails (fast busy signal), it instantly tries the next one. This logic is deployed to **Local, Test, and Production** environments automatically.

---

## CRITICAL: Deployment Workflow

> [!CAUTION]
> **NEVER push directly to `main` (Production) without testing first!**

### Step-by-Step Deployment Process:

#### Step 1: Make Changes Locally
```bash
# Work on the main branch
git checkout main
# Make your code changes...
```

#### Step 2: Bump Version (REQUIRED)
Update version in BOTH files:
- `js/app.js`: Change `APP_VERSION = 'X.X.X'`
- `package.json`: Change `"version": "X.X.X"`

#### Step 3: Deploy to TEST First
```bash
git add .
git commit -m "v1.X.X: Description of changes"
git checkout test
git merge main
git push origin test
```

#### Step 4: Verify TEST Site
- Go to: `https://book-club-companion-git-test-pkrubin.vercel.app`
- Check the footer shows the new version number
- Test all affected functionality
- Confirm it works correctly

#### Step 5: GET USER PERMISSION
> [!IMPORTANT]
> **STOP HERE AND ASK THE USER:**
> "TEST deployment verified at v1.X.X. May I proceed to deploy to Production?"
> 
> **DO NOT proceed without explicit approval.**

#### Step 6: Deploy to Production (Only After Approval)
```bash
git checkout main
git push origin main
```

### Version Numbering:
- **Always bump the version** before any deployment (in both `js/app.js` and `package.json`)
- Format: `MAJOR.MINOR.PATCH` (e.g., 1.1.6)
- The version number in the footer confirms whether a deployment succeeded

---

## Lessons Learned (December 2024)

### 1. Browser Zoom Causes Layout Drift
- **Problem:** Modal looked fine on localhost but broken on Vercel
- **Root cause:** Developer's browser was at 90% zoom on localhost
- **Fix:** Design must work at 100% zoom. Tightened modal spacing.
- **Prevention:** Always test at 100% zoom (`Cmd+0` on Mac)

### 2. CDN Dependencies Should Be Pinned
- **Problem:** Tailwind CDN was unpinned, risking version drift
- **Fix:** Changed `cdn.tailwindcss.com` to `cdn.tailwindcss.com/3.4.1`
- **Prevention:** Pin all CDN dependencies to specific versions

### 3. Backend Changes Require Server Restart
- **Problem:** Changes to `api/gemini.js` not taking effect locally
- **Fix:** Restart `local_server.js` after backend changes
- **Prevention:** Document in workflow (see Phase 2 above)
