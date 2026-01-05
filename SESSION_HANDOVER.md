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

**Work Completed:**
- v1.9.1: Word export for Discussion Guides, button moved to left column, edit icon fix
- v1.9.2: Admin-only audit trail (fixes 406 RLS error), explicit 'member' role for signups
- v1.9.3: Hide "Show Test Data" and "Backup Data" from members

**Database Changes:**
- Added 'member' to user_profiles role constraint: `CHECK (role IN ('admin', 'member') OR role IS NULL)`
- Updated existing NULL roles to 'member'

**Issues Discovered:**
- Missing user profile row caused 406 error (fixed by admin-only audit trail)
- One member profile was missing from user_profiles table (manually re-added)

---

## Known Issues / In Progress
- [ ] Rule-based tagging: "New York" incorrectly added from bestseller references
- [ ] Multi-book-club support (Phase 3 - future)
- [ ] Tag deletion UI may have issues with garbage tags from earlier versions

---

## Database Reference

### user_profiles table
- **Columns:** id, display_name, role, created_at
- **role constraint:** `CHECK (role IN ('admin', 'member') OR role IS NULL)`
- **RLS:** Users can only read their OWN profile
  - Audit trail is admin-only because admins can read all profiles

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

## What NOT to Change Without Asking
- RLS policies in Supabase
- Database schema/constraints
- Production deployments (always test → prod)
- Any destructive operations

---

## End of Session Checklist
Before ending a session, add a new entry to Session Log with:
1. Session start/end dates
2. Version changes
3. Summary of work done
4. Database changes (if any)
5. Issues discovered
