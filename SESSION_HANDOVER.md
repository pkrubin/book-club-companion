# Session Handover

## Current State
- **Version:** 1.9.3
- **Branch:** test (always work on test, never main directly)
- **Last deployment:** PROD on 2026-01-05

---

## Session Log

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
