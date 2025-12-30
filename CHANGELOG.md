# Changelog

All notable changes to the Book Club Companion project will be documented in this file.

---

## 2025-12-30 - Logo Integration & Favicon Refinement (v1.6.3)

**Goal:** Integrate the new icon-only logo and ensure proper alignment and scaling across all platforms.

**Changes:**

| File | Change |
|------|--------|
| `index.html` | Integrated the new icon-only logo (`logo-icon.png`) for login and navigation. |
| `index.html` | Scaled navigation logo to `w-16` and login logo to `w-40`. |
| `index.html` | Pointed favicon to optimized `favicon-32.png`. |
| `js/app.js` | Bumped version to `v1.6.3`. |
| `package.json` | Bumped version to `1.6.3`. |
| `images/` | Generated `favicon-32.png` via `sips` with a tight content crop for better tab alignment. |

**Backup:** `Backups/20251230_164200_logo_refinement/`

---

### [Dec 26] Data Backup System (Phase 1)
*   **New:** "Backup" button in Dashboard header.
*   **Feature:** Full JSON export of library (Books + Metadata).
*   **Mechanism:** Supports "Save As" file dialog and "Copy to Clipboard" fallback.
*   **Location:** `js/app.js` (Export Logic), `project_guidelines.md` (Protocol).

---

## 2025-12-26 - Smart Search & Review UI Fixes

**Goal:** Fix search relevance issues ("New York Times Index"), prevent auto-selection errors, and improve review legibility.

**Changes:**

| File | Change |
|------|--------|
| `js/app.js` | **Smart Search:** Implemented fallback strategies (Title+Author → Title Only → Fuzzy Matching) when API returns poor results |
| `js/app.js` | **Relevance Filter:** Added logic to filter out search results that don't match the query title |
| `js/app.js` | **No Auto-Select:** Search results now require manual selection; modals stay open for review |
| `js/app.js` | **Hover Preview:** Fixed broken/tiny images by using the same thumbnail URL scaled up with CSS |
| `js/app.js` | **Review UI:** Removed opacity dimming from unselected rows; changed to Amber background for better text legibility |

**Backup:** `Backups/20251226_152700_pre_smart_search/`

---

## 2025-12-26 - Bulk Import Refinements & Data Capture

**Goal:** Improve reliability of bulk import with "by" separator, capture Goodreads ratings, and refine the review UI.

**Changes:**

| File | Change |
|------|--------|
| `js/app.js` | Enhanced parser to recognize "by" separator (detects last occurrence) |
| `js/app.js` | Added input cleaning to strip parenthetical notes, (new), and ratings |
| `js/app.js` | Added capture of Goodreads ratings from input to save to database |
| `js/app.js` | Improved `isJunk` filter to exclude bundle sets and box sets |
| `js/app.js` | Relaxed title matching logic to handle long subtitles (80% token overlap) |
| `js/app.js` | Implemented Author fallback: uses query author if Google metadata is missing |
| `js/app.js` | Changed title display from truncation to 2-line wrapping |

**Note:** Editable "Tags" column was added then reverted per user feedback (not as designed).

**Backup:** `Backups/20251226_143600_pre_revert/`

---

## 2025-12-26 - Color Palette Update (Rose → Indigo)

**Goal:** Replace red/rose accent colors with indigo for a calmer, more professional look.

**Changes:**

| File | Change |
|------|--------|
| `index.html` | Added Tailwind config override to remap `rose-*` colors to indigo values |
| `css/styles.css` | Changed ambient background gradient from rose (hue 351) to indigo (hue 240) |
| `css/styles.css` | Changed login page background gradient to indigo |
| `css/styles.css` | Changed card hover shadow from rose bloom to indigo bloom |

**Backup:** `Backups/20251226_102700_pre_color_change/`

**Restore command:**
```bash
cp Backups/20251226_102700_pre_color_change/index.html index.html
cp Backups/20251226_102700_pre_color_change/styles.css css/styles.css
```

---

## 2025-12-26 - Import Progress Indicator Fix

**Goal:** Show visible progress bar during "Add More Books" import flow.

**Changes:**

| File | Change |
|------|--------|
| `js/app.js` | Modified `importMoreBooks()` to show progress bar before collapsing input |
| `js/app.js` | Simplified function to use existing `searchAndQueueBooks()` progress tracking |

**Backup:** `Backups/20251226_083000_pre_table_view/`

---

## 2025-12-24 - Import Text Filter & Input Expansion

**Goal:** Smart filtering of junk text in imports and collapsible import input.

**Changes:**

| File | Change |
|------|--------|
| `js/app.js` | Added smart filter to skip short lines (<3 chars) and common instructional text |
| `js/app.js` | Added expand/collapse toggle for import text area |
| `js/app.js` | Fixed import input to expand when clicking "Add More Books" |

**Backup:** `Backups/20251224_172700_import_filter_progress/`

---

## 2025-12-24 - Edit Book Refined Search

**Goal:** Allow users to find correct book edition when displayed book is wrong.

**Changes:**

| File | Change |
|------|--------|
| `js/app.js` | Added "Refine Search" button to edit modal |
| `js/app.js` | Added search results display within edit modal |
| `js/app.js` | Allow selecting different book result to replace current book data |

---

## 2025-12-22 - Import Modal & File Upload

**Goal:** Enable bulk book import from text input and file upload.

**Changes:**

| File | Change |
|------|--------|
| `index.html` | Added import modal with text area and file drop zone |
| `js/app.js` | Added file reading for .txt and .csv files |
| `js/app.js` | Added import queue review before saving |
| `js/app.js` | Added progress bar for multi-book Google Books API searches |

---

## Template for Future Entries

```markdown
## YYYY-MM-DD - Brief Description

**Goal:** What you were trying to accomplish

**Changes:**
- File: what changed

**Backup:** Backups/YYYYMMDD_HHMMSS_description/

**Notes:** Any important context
```
