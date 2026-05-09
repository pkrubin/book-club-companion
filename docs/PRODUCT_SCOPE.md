# Product Scope

Book Club Companion is a multi-club book club management tool for organizers and members.

## Current Live Shape

- Multi-club is live in both `test` and `prod`
- Sandbox clubs are available for safe testing
- The app uses one shared Supabase database across `test` and `prod`
- Members and admins use role-based UI within the same app

## Primary Users

- Club admins
  - import books
  - enrich metadata
  - manage schedules and discussion guides
  - create sandbox clubs
- Club members
  - browse the current club library
  - view scheduled books
  - use discussion guides
  - propose books

## Current User-Facing Capabilities

### Authentication And Access
- Email/password sign-in
- Invite-based sign-up
- Role-aware UI restrictions

### Club Context
- Club switcher
- Active club preference
- Sandbox club creation for admins
- Club-scoped reads and writes

### Dashboard
- Next-up scheduled book
- Upcoming books
- Empty states for clubs without a schedule
- Calendar export links for scheduled books

### Search
- Google Books search through server-side proxy
- Auth-aware search reliability handling
- Retry for transient upstream Google Books failures

### Library
- Grid and table views
- Filtering and sorting
- Club-scoped library data
- Status, tags, rating, host, and date management

### Book Details
- Rich book metadata
- External links
- Ratings support
- Editable saved-book details
- Role-based editing restrictions

### Discussion Guides
- View, print, and export guides
- AI-assisted generation
- Admin editing and save flow

### Import
- Text import
- Vision import
- Review and confirm flow before save

### Exports And Settings
- Export schedule CSV
- Export by status
- JSON backup/export
- Text size preferences

### Notifications
- Schedule change notifications
- Per-user dismiss tracking

## Product Boundaries

This app is:
- a shared club tool
- oriented around book selection, scheduling, and discussion preparation

This app is not:
- a personal Goodreads clone
- a reading journal
- a generic search launcher

## Current Testing Preference

When testing changes that touch real data:
- prefer sandbox clubs first
- prefer books with status `Test`
- avoid modifying important live `Scheduled` books unless explicitly intended

## Near-Term Simplification Goals

- Keep docs lean and current
- Keep release bookkeeping in `RELEASE_LOG.md`
- Start new work from fresh `origin/test`
- Prefer smaller releases with clear rollback anchors

## Near-Term Backlog

- richer club membership and role management, including a club `manager` role
- super-admin / platform-owner workflows for cross-club administration
- metadata reuse to reduce Goodreads and other API churn across clubs
- more complete invite and club lifecycle tooling
- ongoing tag quality improvements
- future security hardening
- future UI cleanup / optimization
- discussion guide refinement
- admin import / export improvements
- continued documentation simplification
