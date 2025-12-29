# How to Deploy Your App (Step-by-Step)

Great news! Your code is now safely stored on GitHub.
**Link:** [https://github.com/pkrubin/book-club-companion](https://github.com/pkrubin/book-club-companion)

Now you can turn it into a live website using Vercel.

## Phase 2: Go Live with Vercel

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
