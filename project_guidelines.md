# Project Guidelines & Rules of Engagement

## Core Rules of Engagement (Conduct)
1.  **No Deletion:** You may never delete any file - EVER. You may not make directory changes without asking. You cannot assume I said yes if I have not answered.
2.  **Harm Prevention:** Never do anything harmful: I will be thoughtful, careful, and cautious in every action.
3.  **Backups & Reversibility:** Never do anything irreversible. Use the **Backup Suite Protocol** (see below). Ensure every change is revertible.
4.  **Permission:** Always check for permission: Explicitly ask for approval before taking any action that modifies the system or files.
5.  **Silence != Agreement:** Silence is not agreement: Do not proceed without a clear, affirmative response from the user.
6.  **Versioning:** Use proper versioning and version control so every change is revertible.
7.  **Feasibility First:** If asked about feasibility, answer first and don't proceed without approval.
8.  **Access Control:** You may NOT access any files or directories that are not explicitly shared with you and you must verify your intent before accessing any file or directory. Any file manipulation must be approved by me, a human.

## Product Rules (Preferences)
1.  **No "Go Search" Features:** Never implement a feature that simply links the user to a Google Search (e.g., "Find Questions"). The app must provide the *actual content* (e.g., the questions themselves) within the UI.
2.  **Quality & Quantity:** Content must be "outstanding" and "thoughtful." For book club questions, provide **at least 10 numbered questions** to cover a 1.5-hour meeting.
3.  **UI Consistency is Critical:** All UI elements (dropdowns, buttons, fonts) must be consistent in size, color, and spacing. "Weird" or mismatched styling is unacceptable.
4.  **Robust Interactions:** Avoid fragile UI patterns like "hover to reveal" for interactive elements. Use click-to-toggle for reliability.
5.  **Printability:** Content meant for meetings (like guides) must have a dedicated, clean print view.
6.  **Preserve History:** Do not delete data or features. Use versioning or "soft delete" flags (e.g., `deleted_at`, `is_active`) to maintain a historical record.

## Core Philosophy
1.  **Dashboard First:** The Dashboard is the primary landing page. It should provide an instant snapshot of "Next Up" and upcoming books.
2.  **Content Over Homework:** Features should provide *value* directly (e.g., actual discussion questions), not just link to search results (no "Go Google it").
3.  **Visual Clarity:**
    *   **Contrast:** Use `bg-stone-100` for the main background to make white content cards pop.
    *   **Constraint:** Hero cards should be constrained (`max-w-3xl`) to avoid feeling "overpowering" on large screens.
    *   **Consistent Styling:** Dropdown options and buttons must have identical styling (font, size, color, padding).
4.  **Accessibility First:**
    *   **Direct Control:** Avoid ambiguous toggles. Use direct selection patterns (e.g., Popover Menus) for preferences like font size.
    *   **Visual Harmony:** Test layouts at extremes (90% to 125% scale). Use `rem` units for *everything* (padding, icons, gaps) to ensure the UI scales proportionally with text.

## Data Architecture
1.  **Single Source of Truth:** The `target_date` field is the absolute truth for:
    *   **Status:** Future date = `Scheduled`, Past date = `Read`.
    *   **Year:** The "Club Year" is derived dynamically from the `target_date`.
2.  **No Redundancy:** The manual `club_year` field has been removed to prevent data drift.
3.  **Auto-Enrichment:**
    *   **Tags:** Automatically generated from book metadata upon save/import. Support decades (e.g., "1920s") and locations.
    *   **Ratings:** Automatically fetched from Open Library (via ISBN or Title/Author match) upon save.

## Feature Specifics

### Organizer Experience (UX/CX)
*   **Import Enrichment:** Reduce toil by allowing the organizer to **clean and enrich data** (e.g., edit tags) *during* the import process, before saving to the database.
*   **Data Richness:** Auto-tagging must go beyond basic genres to include specific Eras (Decades, Wars) and Locations to aid in "variety" decision-making.

### Code Quality & Standards
*   **Zero Magic Strings:** Use constants for repeated strings.
*   **Pure Functions:** Prefer pure functions for logic; keep side effects (UI updates, API calls) isolated.
*   **Comments:** Comment *why*, not *what*.
*   **Changelog:** After significant changes, update `CHANGELOG.md` in the project root with: date, description, files changed, and backup location.
*   **Scope Hygiene:** Never assume global scope (e.g., `const Logger`). Explicitly attach to `window` if global access is required. Use IIFEs or modules to prevent pollution.

### Lessons Learned (Retrospectives)
#### [Dec 15] The "Silent Failure" Protocol
*   **Measure Twice, Cut Once:** innovative logic or untested refactors must be validated with a "Simulation Script" *before* integration.
*   **Zero Assumptions:** Never assume a tool (like a Logger) works just because code exists. Verify it with a specific test (e.g., `window.onerror`) before relying on it.
*   **Atomic Steps:** Separate **UI Refactors** from **Logic Changes**. If debugging is hard, revert and break the task into smaller pieces.
*   **Validation First:** Start every debugging session by proving the error exists (repro) and end by proving the fix works (verification).

#### [Dec 26] Avoid Brittle Solutions
*   **No Inline Style Overrides:** Avoid `element.style.display = 'block'` as a "fix" for CSS class issues. Find and fix the root cause.
*   **Temporary Debug Only:** Inline overrides may be used *temporarily* to troubleshoot, but must be removed once the real issue is found.
*   **Use Browser DevTools:** When UI elements aren't appearing, use browser JavaScript console or DevTools to inspect the actual DOM state before guessing at fixes.


#### [Dec 26] Search & UI Resilience
*   **Trust but Verify (Relevance Gates):** API search results are often "fuzzy" or irrelevant (e.g., matching "Index" instead of a Title). **Always implement a client-side relevance check** (e.g., token overlap) to filter garbage before showing it to the user.
*   **Asset Stability (No URL Guessing):** Do not "guess" asset URLs (e.g., changing `zoom=1` to `zoom=0`) to get better quality if the API is inconsistent. **Stability > Perfection.** It is better to rely on a known working URL (thumbnail) and scale it up with CSS than to show a broken image.
*   **Semantics Matter (Opacity vs. State):** **"Unselected" != "Disabled".** Never use `opacity` to dim rows the user might need to read or select. Use background colors (e.g., `bg-amber-50`) to indicate state while preserving full text contrast.
*   **Ambiguity Requires Interaction:** In refinement workflows (e.g., "Search Again"), **never auto-select** the first result. Explicitly keep the UI open and require a deliberate user click to confirm the choice.

### Discussion Guide
*   **Trigger:** Activates automatically for the "Next Up" book (nearest future date).
*   **Content:**
    *   **Curated:** Specific, high-quality questions for special books (e.g., *Origins of The Wheel of Time*).
    *   **Universal:** A fallback set of 10 thoughtful, numbered questions for all other books.
*   **Functionality:** Must be **Viewable**, **Printable** (clean layout), and **Editable** (saved to DB).
*   **Quantity:** Always provide at least **10 numbered questions**.

### Calendar Integration
*   **Dropdowns:** Use **Click-to-Toggle** (not hover) for reliability.
*   **Wording:** Use simple, user-friendly terms (e.g., "Outlook / Apple", not "Download .ics").
*   **Formats:** Support both Google Calendar (Link) and ICS (File Download).

### UI/UX Preferences
*   **Hero Card:** Horizontal "Ticket" style layout.
*   **Image Styling:**
    *   **Framed & Centered:** All book covers (Dashboard, Search, Library, Modal) must be contained in a gray box (`bg-stone-100`) with padding and centered using flexbox.
    *   **Scaling:** Use `object-contain` and `max-h` constraints. Never use `object-cover` which crops artwork.
    *   **Resolution:** For Modals, force high-resolution images by using `zoom=0` in the Google Books URL (note: may include "page curl").
*   **Print Styles:**
    *   **Clean:** Use `@page { margin: 0 }` and custom body padding to suppress browser headers/footers (e.g., "about:blank").
    *   **Branded:** Print views must include the app header and footer with consistent typography (Playfair Display).
*   **Mobile Responsiveness:**
    *   **Layouts:** Use compact list views for search results and libraries on mobile. Avoid giant stacked cards.
    *   **Modals:** Ensure modal images are constrained (e.g., `h-48`) so they don't dominate small screens.
*   **Navigation:** "Find Books", "Library", and "Dashboard" are the core nav items.
*   **Modals:** Ensure scrolling is re-enabled (`closeModal()`) after actions like saving.

## Technical Stack
*   **Frontend:** Vanilla HTML/JS + Tailwind CSS.
*   **Backend:** Supabase (PostgreSQL).
*   **APIs:** Google Books (Search/Data), Open Library (Ratings).

## Orientation Protocol (Start of Session)
**Future Agent: Read these files in this EXACT order before doing anything else:**
1.  **`project_guidelines.md`** (Root): Read this **ENTIRE file** first. Understand the "Zero Guessing" rule and the history of errors.
2.  **`task.md`** (Located in `.gemini/antigravity/brain/<conversation-id>/`): Check the current status. What is finished? What is next?
3.  **`index.html`** (Root): Understand the DOM structure (IDs and CSS Classes) to avoid "Element not found" errors.
4.  **`js/app.js`** (js/): Read the logic *before* you assume how it works.
5.  **`css/styles.css`** (css/): Understand CSS class names that may be referenced in JavaScript selectors.

## Development Protocols & Lessons Learned

### THE GOLDEN RULE: ZERO GUESSING
**Thinking you know is not enough. You must VERIFY.**
*   **Schema:** Do not guess column names or constraints. Check the database.
*   **Code:** Do not guess variable names or context. Read the file.
*   **State:** Do not guess if a server is running. Check the process.
*   **UI:** Do not guess if a button rendered. Check the DOM.
*   **If you are forced to guess, STOP and ask the user or use a tool to find the answer.**

### Protocols
1.  **Code Application:**
    *   **Verify Integrity:** Never assume a code block was applied correctly, especially with multi-chunk edits. Check the file content immediately if any error is reported.
    *   **Partial Updates:** If a tool fails partially, stop and assess. Do not proceed to verify a broken state.
2.  **Schema First:**
    *   **Inspect Before Write:** Always check the database schema (`status` enums, column names) before writing new data handling logic. Don't guess constraints.
3.  **UI Logic & Regressions:**
    *   **Preserve Sad Paths:** When modifying `if/else` logic (e.g., adding "Skipped" states), explicitly ensure the fallback `else` (rendering the actual results) is not accidentally removed.
    *   **Feature Verification:** If a new button (e.g., "Search More") is not clickable in verification, assume it wasn't rendered (code issue) rather than blaming the test tool. Check the code first.
4.  **No Hardcoding:**
    *   **Resist Temptation:** Resist hardcoding simple values (like API versions, fixed IDs, or magic strings) no matter how tempting or "fast." Use constants or configuration objects.
5.  **Search & Evaluate (Not Replace):**
    *   **Dangerous:** Global "Search and Replace" is dangerous and forbidden.
    *   **Method:** Use "Search and Evaluate" to inspect every instance in context before applying changes.
6.  **Debug Order (Frontend First):**
    *   **Start at the UI:** Never assume a database error first. Start debugging at the UI/Console level, then check Network requests/payloads.
    *   **Work Down the Stack:** Only suspect the database if the Network request is correct but the response is a 500 error. Don't waste time checking `psql` if the JS is sending `null`.
7.  **Precision & Context (No "AI Typos"):**
    *   **Read Before Write:** "Typos" happen when expecting one variable name (e.g. `authors`) but the code actually uses another (e.g. `author`).
    *   **Action:** Always read the file context *immediately* before applying an edit to ensure 100% character-match on variables and strings. Never guess symbol names.

## Testing Strategy
1.  **Hybrid Workflow (Auth Handling):**
    *   **Step 1 (Agent):** Spin up the local server (e.g., `localhost:8080`).
    *   **Step 2 (User):** User opens the URL (ideally in Incognito), verifies connectivity, and **logs in**.
    *   **Step 3 (Agent):** Agent **waits** for User confirmation ("I am logged in"), then resumes automated verification against the live server.
2.  **Isolation:** Use Incognito windows to ensure a clean state.
3.  **Visual Verification:** Verify UI elements (Hero Card, Modals, Dropdowns) match the design system.
4.  **Functional Verification:** Verify all core features are functional (e.g., add new card, select card, update card data, (e.g. change date, genre, ratings), delete card etc.).
5.  **Edge Cases:** Verify all edge cases are handled (e.g., empty states, error states, etc.).
6.  **Performance:** Verify the app is performant (e.g., no slow loading, no memory leaks, etc.).
7.  **Responsive Design:** Verify layout on mobile, tablet, and desktop viewports.
8.  **API Resilience:** Verify behavior when external APIs (Google Books, Open Library) are slow or fail.

## Human-AI Co-Testing Protocol (CRITICAL)

### The Golden Rule: Human Logs In, AI Tests
**AI does NOT have valid credentials and must NEVER attempt to log in.** The Human is the only one who can authenticate. Once authenticated, the AI can test everything else.

### Step-by-Step Co-Testing Workflow
1.  **AI Preparation:**
    *   Ensure the local server is running (`localhost:8080`).
    *   Make any necessary code changes.
    *   Notify the Human: "Please log in so I can test."

2.  **Human Action:**
    *   Human opens `http://localhost:8080` (or other defined localhost address) in the browser.
    *   Human enters their credentials and clicks "Sign In".
    *   Human confirms: "I am logged in" or provides current browser state.

3.  **AI Testing (Post-Login):**
    *   AI uses `browser_subagent` to interact with the **already authenticated** session.
    *   **CRITICAL:** AI must NOT navigate to a new URL (e.g., `open_browser_url`) as this may trigger a new session and lose the login state.
    *   AI clicks on UI elements, captures screenshots, checks console logs.
    *   AI reports findings to the Human.

4.  **If Page Reload is Needed:**
    *   AI should use browser refresh (F5 or reload button) instead of navigating to a new URL.
    *   If the session is lost, AI must ask the Human to log in again.

### What AI Can Do (Post-Login)
- Click buttons, links, and interactive elements
- Capture screenshots
- Check browser console for errors
- Execute JavaScript to inspect DOM state
- Fill in form fields (except login credentials)
- Navigate between sections (Dashboard, Library, Search)

### What AI Must NEVER Do
- Enter login credentials (AI does not have them)
- Navigate to a new URL that would reset the session
- Assume a session exists without Human confirmation
- Guess or fabricate credentials

## Lessons Learned: Dec 24, 2024 ("The Silent Crash")

### Root Cause Summary
A CSS class mismatch (`text-rose-600` in JS vs `text-stone-800` in HTML) caused a `TypeError` that silently crashed the initialization sequence, preventing books from loading.

### Rule 1: CSS/JS Synchronization
**When HTML classes are modified, ALL corresponding JavaScript selectors must be updated.**
- Example: Changing `<span class="text-rose-600">` to `<span class="text-stone-800">` requires updating `querySelector('span.text-rose-600')` in JavaScript.
- **Action:** After any CSS class refactor, search the JavaScript codebase for affected selectors.

### Rule 2: Silent Crashes Kill Everything
**A `TypeError` in an early initialization function halts ALL subsequent code.**
- JavaScript does not continue after an unhandled exception.
- If `updateFontSizeMenu()` crashes, `fetchSavedBooks()` never runs.
- **Action:** Wrap non-critical UI helpers in `try/catch` blocks OR ensure null-safety on all DOM queries.

### Rule 3: Console Errors First
**Before guessing the cause, CHECK THE BROWSER CONSOLE.**
- The console clearly showed `TypeError at line 189` - that was the smoking gun.
- Guessing at auth timing, race conditions, and filter logic wasted significant time.
- **Action:** When debugging, the FIRST action should be `capture_browser_console_logs`.

### Rule 4: Backup Suite Protocol
**All coupled files must be backed up together in a timestamped directory.**

#### Directory Structure
```
Backups/
├── YYYYMMDD_HHMMSS_description/
│   ├── README.md          # Purpose, status, notes
│   ├── app.js             # Copy of js/app.js
│   ├── index.html         # Copy of index.html
│   └── styles.css         # Copy of css/styles.css
```

#### Naming Convention
- **Format:** `YYYYMMDD_HHMMSS_short_description`
- **Example:** `20251224_152300_library_fix`
- **Description:** 2-4 words describing the change or milestone

#### README.md Template
```markdown
Backup created: YYYY-MM-DD HH:MM:SS
Purpose: [Brief description of what was fixed/changed]
Files included: [list of files]
Status: WORKING | BROKEN | UNTESTED
Notes: [Any additional context]
```

#### Coupled File Pairs (Always Backup Together)
| Primary File | Coupled Files |
|--------------|---------------|
| `js/app.js` | `index.html` (DOM IDs, CSS classes referenced in JS) |
| `index.html` | `js/app.js` (event handlers, selectors), `css/styles.css` |
| `css/styles.css` | `index.html` (class names), `js/app.js` (dynamic class changes) |
| Database Schema | `js/app.js` (column names, enums referenced in queries) |

#### When to Create a Backup
- Before any large-scale refactoring
- After a bug is fixed and verified working
- Before experimenting with new features
- At the end of a successful work session

### Rule 5: Verify, Don't Guess
**Testing first reveals the true error immediately.**
- Multiple incorrect hypotheses (auth timing, race conditions, filter logic) were pursued.
- Actually running browser tests with console capture would have shown the error instantly.
- **Action:** Use browser subagent to TEST before making more code changes.

### Rule 6: Incremental Changes with Verification
**Make one small change, test, then proceed.**
- The import filter work succeeded because each change was tested immediately.
- When changes were bundled (junk filter + scoring in one edit), bugs compounded.
- **Action:** One logical change per edit. Verify before moving on.

### Rule 7: Avoid Hard-Coded Filters
**Hardcoded lists (stopwords, junk patterns) are fragile.**
- Stopwords like "book" work for some queries but may break others.
- Better approach: weighted scoring, percentage thresholds, fuzzy matching.
- **Action:** Document known limitations. Iterate based on real test failures.

### Import Matching: Known Issues (Dec 24)
- Junk filter works: summaries, adaptations, pre-1900 filtered
- Title relevance scoring works: best match appears first  
- Stopwords filter works but is fragile
- **TODO:** Horizontal card layout, pre-selection UI, "Confirm All" button

#### [Dec 26] Hidden Database Constraints
- **The Issue:** Attempting to add a new status "Test" failed silently or with a generic error because of a hidden `CHECK` constraint on the `status` column, which wasn't visible in the standard table view.
- **Lesson:** **Never assume free-text input** for columns like `status` or `category`. Always assume there might be a constraint.
- **Action:** Before adding new enumerated values, run a SQL query to inspect constraints: `SELECT * FROM pg_constraint WHERE conrelid = 'table_name'::regclass`.

## Data Management & Backup Protocol
### 1. User-Initiated Backup (Export)
*   **Trigger:** "Backup" button in the Dashboard Header.
*   **Format:** JSON file with metadata wrapper: `{ metadata: { source, exported_at }, books: [...] }`.
*   **File Naming:** `book-club-backup-YYYY-MM-DD-HH-mm.json`.
*   **Saving Mechanism:**
    *   **Primary:** `window.showSaveFilePicker()` (Modern "Save As" flow).
    *   **Fallback:** `navigator.clipboard.writeText()` (Copy to Clipboard) if file system access fails.
*   **Safety:** Read-ready only. No database modifications.

### 2. Restore Protocol (In Progress)
*   **Strategy:** "Additive Merge".
    *   **Existing Books:** Skipped (Duplicate Prevention).
    *   **New Books:** Inserted.
*   **Input:** Supports both File Upload and Pasted JSON text.


## Security & Deployment Roadmap
1.  **Current Security (Local Only):**
    *   **Method:** `js/config.js` holds the key locally and is `.gitignore`'d.
    *   **Usage:** Fine for development. Key is exposed in the user's browser but restricted by Referrer (localhost).
2.  **Future Public Deployment (Netlify/Vercel):**
    *   **Problem:** You cannot put the key in client-side JS on a public URL without risking abuse. Referrer restrictions are not 100% foolproof against spoofing.
    *   **Solution:** Use a Backend Proxy.
    *   **Implementation:**
        1.  Create a Supabase Edge Function (e.g., `process-image`).
        2.  Store Gemini API Key in Supabase Secrets (Backend Env Var).
        3.  Frontend uploads image to Supabase Function -> Function calls Gemini -> Returns JSON.
        4.  This keeps the key completely hidden from the browser.
3.  **Deployment Steps:**
    1.  Get code to GitHub (done, with .gitignore).
    2.  Connect GitHub repo to Netlify/Vercel.
    3.  Add `http://your-site.netlify.app` to Google API Key restrictions.
    4.  (Ideally) Migrate to Supabase Functions before "going viral".

## Authentication & User Accounts
*   **System:** We use **Supabase Auth** (not a mock/fake system).
*   **Requirement:** You must log in with a **valid email and password** that exists in the Supabase `users` table.
*   **Testing:**
    *   **Do NOT** use fake strings like "admin/admin".
    *   **DO** use the specific test account created during setup (or create a new one via the "Sign Up" link).
*   **Troubleshooting:** If you forget credentials, go to the [Supabase Dashboard > Authentication > Users](https://supabase.com/dashboard) to view registered emails or reset passwords.

## Retrospective: Visual Import Experiment (Dec 2024)
*   **What Worked:**
    *   **Vision API:** Google Gemini Vision is highly effective at identifying books from covers/lists.
    *   **Client-Side Integration:** Using `fetch` directly from the browser (with a secured local key) is a viable MVP strategy.
*   **What Failed (The 404 Bug):**
    *   **Hardcoded Versions:** Creating a dependency on specific model versions (e.g., `gemini-1.5-flash`) caused failures. New API keys often have access *only* to newer models (like `2.5`) or specific subsets, and Google returns a generic `404 Not Found` which is misleading.
*   **The Fix:**
    *   **Use Aliases:** We switched to `gemini-flash-latest`. This alias automatically resolves to the best stable internal model available to the key, future-proofing the app against version deprecation or access tier differences.

#### [Dec 27] Resilient Scraping Strategy
*   **Proxy Redundancy:** When scraping external sites (like Goodreads) from the client-side, **single proxies fail**. Implement a fallback chain (e.g., AllOrigins -> CorsProxy).
*   **Timeouts are Mandatory:** `fetch()` does not timeout by default. Always wrap proxy requests in a timeout (e.g., 5s) using `AbortController` to prevent the UI from checking "forever".
*   **Robustness > Perfection:** If scraping fails, have a graceful fallback (e.g., OpenLibrary) and clear UI indicators (Color-coded badges) so the user understands the data source.

#### [Dec 27] Metadata Repair Protocol
*   **Immediate Persistence:** "Repair" actions (e.g., fetching missing data for an existing book) should commit to the database **immediately**, rather than waiting for a "Save" action. This reduces friction for legacy data cleanup.
*   **UI Feedback:** Always provide immediate visual feedback (e.g., filling inputs, refreshing badges) so the user knows the repair succeeded.

#### [Dec 27] Tags vs. Status
*   **No Duplication:** Tags should never duplicate the active Status. The rendering logic must filter out any tags that match the current status (case-insensitive).

#### [Dec 28] AI Service Architecture
*   **Token Limits:** Default AI responses (often ~300 tokens) are too short for complex content like Discussion Guides. **Always explicitly set `maxTokens` (e.g., 2000)** in the API payload.
*   **Method Consistency:** Ensure your client `fetch` method matches the server handler (e.g., if server expects `POST`, client must send `POST`). Mismatches cause generic 404/500 errors.
*   **Environment Variables:** Local development uses `.env.local` + `local_server.js`, but production (Vercel) requires setting secrets in the Project Dashboard. **Never check API keys into git.**

#### [Dec 28] Schema Verification (The Silent Killer)
*   **Code != Schema:** Adding a field to `app.js` (e.g., `discussion_questions`) does NOT automatically add it to Supabase.
*   **Symptom:** The app works locally (memory) but fails to persist on reload.
*   **Protocol:** When adding new data fields, **ALWAYS** write the corresponding SQL migration (`ALTER TABLE...`) in `task.md` and verify it in the dashboard.