# Session Handover

> **Start with `AGENTS.md` first.** This handover is supporting context, not the canonical repo instruction file.

## 🚨 Operational Protocol for New Agents (READ FIRST)
This protocol ensures a smooth handoff and prevents protocol breaches.

### The 9 User Desirements (Code of Conduct)
1.  **Predictable Handoffs**: Standardize this `SESSION_HANDOVER.md`.
2.  **Mission & Version Clarity**: High-priority "Wait for Pre-flight" in `README_FOR_AI.md`.
3.  **Privacy/No Credentials**: ZERO tolerance for login attempts.
4.  **Assisted Testing**: AI verify footer/version ONLY if app is visible; Human verify features.
5.  **No Retraining**: All lessons must be in `project_guidelines.md`.
6.  **Thoughtful & Careful**: Small incremental steps; "Verify Before Push".
7.  **No Vercel/Platform Audits**: Use direct links; if redirect, report "ENVIRONMENT PROTECTED" and STOP.
8.  **Active Tab Protocol**: Scan `browser_state` and reuse `[ACTIVE]` tab; NO redundant tabs.
9.  **Partner Conduct**: Unpredictable behavior is a failure.

### The Protocol of Adaptive Precision
Instead of rigid rules, we use adaptive, resilient protocols:
1.  **Environment Visibility Protocol**: 
    - Navigate to the intended URL (DEV/TEST/PROD).
    - **IF** the app UI is visible (Dashboard/Login button on our app): Report the version found in the footer.
    - **IF** redirected to ANY OTHER SITE (Dashboard, SSO, Login Wall, Platform Auth): **STOP IMMEDIATELY**. Report "ENVIRONMENT PROTECTED" and wait for user.
    - **NEVER** attempt to log out to see a version number.
    - **NEVER** click "Login" or "Sign In" on external/platform sites.
2.  **Tab Lifecycle Management**: Always scan `browser_state` for matching URLs before navigating. Priority: `[ACTIVE]` matching tab > Existing tab > New tab.

---

## Current State
- **Version:** 1.9.6
- **Branch:** main
- **Last deployment:** PROD on 2026-01-12

## Current Canonical Multi-Club Work
- **Canonical branch:** `codex/app-club-awareness-testready`
- **Canonical worktree:** `/private/tmp/book-club-app-club-testready`
- **Canonical preview URL:** `http://127.0.0.1:8080`
- **Detached preview rule:** loose `/private/tmp/...` preview copies are disposable unless reconciled back into the canonical worktree the same session

---

## Session Log

### Session: Jan 12, 2026 (Adaptive Precision Overhaul)
**Started:** 2026-01-12
**Ended:** 2026-01-12

**Deployments:**
- Documentation only (no version bump)

**Work Completed:**
- **Adaptive Precision Protocol:**
    - Implemented "Environment Visibility Protocol" (redirect = STOP, no login wall audits).
    - Removed TEST from browser audit; now uses `git log test -1` only.
    - Added stale-tab detection for PROD (compare git vs browser, refresh if mismatch).
- **Renamed "The 10-Second Stop" → "Verify Before Push"** across 7 files.
- **Pre-flight Overhaul:**
    - Code-based version check (`js/app.js`, `git log`).
    - Browser audit for Localhost and PROD only.
    - Explicit blacklist for TEST URL to prevent Vercel SSO redirects.
- **Codified the 9 User Desirements** in `SESSION_HANDOVER.md` as the Code of Conduct.

**Issues Resolved:**
- AI was navigating to protected TEST URL and getting stuck at Vercel login.
- Fixed by removing TEST from browser audit entirely.

---

### Session: Jan 11-12, 2026
**Started:** 2026-01-11
**Ended:** 2026-01-12

**Deployments:**
- v1.9.6 (Deployed to PROD)

**Work Completed:**
- **Autopsy & Restoration:** Successfully recovered work interrupted by system reboot (Jan 11-12).
- **Tester's Guide Finalization:**
    - Added Section 4: "Exploring Book Details (Ratings & Links)".
    - Renumbered all subsequent sections and missions (1-9).
    - Added cautionary note about ratings retrieval time (can take ~1 min).
    - Added warning for testers about shared discussion guides.
    - Explained "Export Library/Status" feature in Settings.
- **Safety & Protocols:**
    - Codified "Verify Before Push" in `project_guidelines.md`.
    - Updated `DEPLOYMENT_GUIDE.md` and `README_FOR_AI.md` with correct Vercel environment URLs.
- **Documentation Sync:** Brought `CHANGELOG.md` and `SESSION_HANDOVER.md` up to date with v1.9.6 state.

- **Documentation Overhaul**:
    - Rebuilt `DEPLOYMENT_GUIDE.md` for AI-optimized maintenance.
    - Updated `pre-flight.md` workflow with automatic server check and "Login Screen Audit" protocol.
    - Added "Direct Navigation Rule" to all protocols.
    - Archived legacy setup guides.
- **Safety & Protocols**:
    - Formally codified the "Login Screen Version Check" in `project_guidelines.md`.
    - Integrated "Direct Navigation Rule" to prevent agents from wandering into intermediate dashboards.

**Issues Discovered:**
- **Audit Perfectionism**: AI agents were breaching login walls in an attempt to complete the version audit.
- **Documentation Drift**: Legacy setup instructions were confusing agents during routine maintenance tasks.

---

#### [Jan 12] Environment Visibility & The Redirect Stop
*   **The Problem:** During the `/pre-flight` audit, the agent attempted to check the version of the TEST site. The site was protected by Vercel SSO, which redirected the agent to a Vercel Login page. Previous attempts to "audit the footer" of this login wall led to "Audit Perfectionism," where the agent would click "Login" or get stuck in a loop trying to find information on a site that wasn't the app itself.
*   **The Root Cause:** **Audit Perfectionism & Rigid Instructions.**
*   **The Fix:** 
    *   **Environment Visibility Protocol**: Navigate -> If app UI is visible, audit. If redirected anywhere else (SSO/Platform), **STOP** and report "ENVIRONMENT PROTECTED."
    *   **No Platform Audits**: AI never interacts with or audits login walls for Vercel, Supabase, or GitHub.
*   **The Lesson:** If the app isn't visible, the audit is over.

---

### Session: Jan 10-11, 2026
**Started:** 2026-01-10  
**Ended:** 2026-01-11

**Deployments:**
- v1.9.4 → v1.9.5 (deployed to PROD)

**Work Completed:**
- v1.9.5: Recent Changes notification dropdown
  - Bell icon with unread badge in header
  - Per-user dismiss tracking (new `user_dismissed_notifications` table)
  - "Mark all read" and "Clear all" bulk actions
  - Natural language descriptions ("Sarah is now hosting", "Moved to Feb 10")
  - Shows who made each change and when ("by pamrubin • 5m ago")
  - Clear visual distinction (left border + tint for unread items)
  - Logged changes for host, date, time on Scheduled books

**Database Changes:**
- Created `schedule_changes` table for logging host/date/time changes
- Created `user_dismissed_notifications` table for per-user dismiss tracking
- Added `last_seen_at` column to `user_profiles` for tracking new vs read
- Ran one-time migration to set default 7:15 PM meeting time for books with null times

---

### Session: Jan 4-5, 2026
**Started:** 2026-01-04  
**Ended:** 2026-01-05

**Deployments:**
- v1.9.0 → v1.9.1 → v1.9.2 → v1.9.3 (all deployed to PROD)

**Work Completed:**
- v1.9.0: AI tagging improvements (shorter prompts, better JSON parsing)
- v1.9.1: Word export for Discussion Guides, button moved to left column, edit icon fix, print citation fix
- v1.9.2: Admin-only audit trail (fixes 406 RLS error), explicit 'member' role for signups
- v1.9.3: Hide "Show Test Data" and "Backup Data" from members

**Database Changes:**
- Added 'member' to user_profiles role constraint
- Updated existing NULL roles to 'member'
- One missing user profile was manually re-added

**Database Design Decisions:**
- **RLS on user_profiles:** Kept restrictive (users read only own profile). Audit trail made admin-only to avoid 406 errors for members. This avoids opening up profile data while still showing "Proposed by" to admins.
- **Explicit 'member' role:** Changed from NULL to 'member' for clarity. Future: member/manager/admin hierarchy for multi-club support.
- **No RLS policy change needed** because we hid the feature from members instead.

**Issues Discovered:**
- Discussion Guide edit button icon wasn't showing (JS was using textContent which wiped the icon)
- 406 error when member views book proposed by different user (RLS blocking profile lookup)
- Missing user profile caused lookup failures

---

## Known Issues / In Progress
- [ ] Rule-based tagging: "New York" incorrectly added from bestseller references
- [ ] Tag deletion UI may have issues with garbage tags from earlier versions
- [ ] Multi-book-club support (Phase 3 - future)
- [ ] Consider VIEW approach for user_profiles when email/phone added later
- [x] ~~**Host Alerts**: Build notifications when a host claims a month or changes a meeting time~~ (Completed v1.9.5 - "Recent Changes" dropdown)

---

## Database Reference

### user_profiles table
- **Columns:** id, display_name, role, created_at
- **role constraint:** `CHECK (role IN ('admin', 'member') OR role IS NULL)`
- **RLS:** Users can only read their OWN profile (kept restrictive by design)

### book_club_list table  
- **status constraint:** `CHECK (status IN ('Priority', 'Possible', 'Later', 'Deprioritize', 'Read', 'Proposed', 'Scheduled', 'Test'))`

---

## Role-Based UI Reference
**Admin-only features (hidden from members):**
- Import button (nav)
- Backup Data button (settings)
- Show Test Data toggle (settings)
- Audit trail in book modal ("Proposed by...", "Last modified by...")

---

## Testing Rules
- **AI CANNOT log in** - only human has credentials
- **AI must wait** for human to confirm "I am logged in" before testing
- Use books with status **"Test"** for destructive testing
- **NEVER modify** books with status "Scheduled" during testing
- Test on localhost → test branch → prod (never skip steps)

---

## What NOT to Change Without Asking
- RLS policies in Supabase
- Database schema/constraints
- Production deployments
- Any destructive operations
- Books with "Scheduled" status

---

## End of Session Checklist
Add a new entry to Session Log with:
1. Session start/end dates
2. All version changes and deployments
3. Work completed
4. Database changes and WHY
5. Issues discovered
