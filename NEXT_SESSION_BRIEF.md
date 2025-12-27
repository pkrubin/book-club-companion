# Next Session Brief (Handover)
**Date:** Dec 26, 2025
**Status:** Stable / Mid-Feature

## 1. Current State
*   **Feature In-Progress:** Backup & Restore System.
*   **Phase 1 (Export):** ✅ **COMPLETE & VERIFIED.**
    *   User can backup via "Download File" (Save As) or "Copy to Clipboard".
    *   Code is in `js/app.js` (`exportLibrary`).
*   **Phase 2 (Restore):** ⏳ **PLANNED, NOT STARTED.**
    *   We need to build the `importBackup` function and the Restore Modal.
    *   **Goal:** Additive restore (Smart Merge). Skip duplicates, insert new books.

## 2. Recent Achievements (Verified)
*   **Smart Search:** Fixed relevance issues ("New York Times Index" bug).
*   **"Test" Status:** Successfully added a "Test" status to the database enum and UI (yellow badge) to allow isolating test books.
*   **Backup Protocol:** Documented in `project_guidelines.md`.

## 3. Immediate Next Steps (For New Agent)
1.  **Read `project_guidelines.md`**: Especially the new "Data Management" and "Hidden Constraints" sections.
2.  **Read `implementation_plan.md`**: Review the approved plan for **Phase 2: Restore**.
3.  **Start Phase 2:**
    *   Create `RestoreModal` UI (with Paste Text area).
    *   Implement `importBackup(json)` logic.
    *   **Constraint:** Handle duplicates by SKIPPING them (checking Title+Author or ID). Do not wipe the database.

## 4. Regression Findings (To Be Addressed)
These findings came from a mid-point regression test and need to be prioritized:
*   **Horizontal Card Layout:** The import review list is currently vertical and can be long. We need to switch to a horizontal card layout for better density.
*   **Pre-Selection UI:** Improve how books are selected/deselected before import.
*   **"Confirm All" Button:** Add a quick way to import everything found without clicking one by one.
*   **Stopwords Fragility:** The "stopword" filter for search is functional but brittle; consider refining it if false negatives occur.

## 5. Backlog Items
*   **UI Polish:** The focus ring on the status dropdown is currently amber/orange (default). User may want this changed to neutral stone/gray later. 

## 5. Critical Context
*   **Database Constraints:** The `status` column has a CHECK constraint. If you add new statuses, you MUST update the database constraint first (see `project_guidelines.md`).
*   **Browser Downloads:** Do not try to force filenames via hacks. We use `showSaveFilePicker` with a `Clipboard` fallback. Do not change this back to `blob` hacks.
