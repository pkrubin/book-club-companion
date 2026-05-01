# Security Hardening Report

## Executive Summary

This overnight branch fixes the most immediate app-layer issues I could address safely without changing your database schema in production: the server-side proxy routes now require a valid Supabase session, the Vision Import flow no longer asks the browser to hold its own Gemini key, several high-traffic UI rendering paths now escape untrusted book/discussion content, and the local dev server no longer depends on missing packages just to boot.

The biggest remaining risks are structural rather than cosmetic: the checked-in Supabase schema is stale and still grants broad write access, signup invite-code consumption is race-prone and client-driven, and a few DOM-rendering paths still interpolate database-backed strings into `innerHTML`.

## Fixed On This Branch

1. `api/gemini.js`, `api/books.js`, and `api/goodreads.js` now require a verified Supabase bearer token before they do upstream work.
2. `js/app.js` now sends the current session token to those routes, and Vision Import uses the authenticated proxy instead of a browser-stored Gemini key.
3. `js/app.js` now escapes and normalizes book-card, dashboard, library, description, and discussion-guide content in several high-traffic rendering paths.
4. `local_server.js` now uses built-in Node APIs and serves the current API routes without `express` or `dotenv`.

## Remaining Findings

### 1. Permissive RLS still allows any authenticated user to write shared club data

- Severity: High
- Location: [schema.sql](/private/tmp/book-club-overnight/schema.sql:33)
- Evidence: the checked-in policies allow authenticated users to `INSERT`, `UPDATE`, and `DELETE` with `true` conditions.
- Impact: any signed-in member can bypass hidden buttons and mutate shared records directly from the browser or API client.
- Fix direction: move authorization into real RLS or RPCs, for example by distinguishing member proposals from admin-maintained shared fields.

### 2. Checked-in schema is not a trustworthy rebuild or recovery path

- Severity: High
- Location: [schema.sql](/private/tmp/book-club-overnight/schema.sql:1)
- Evidence: the file only defines `book_club_list`, but the app also depends on `invite_codes`, `user_profiles`, `schedule_changes`, `user_dismissed_notifications`, and newer columns on saved books.
- Impact: rebuilding from the repo can silently produce an incomplete or insecure environment.
- Fix direction: capture the live schema as migrations and make repo schema the source of truth again.

### 3. Invite-code signup is still client-driven and race-prone

- Severity: Medium
- Location: [js/app.js](/private/tmp/book-club-overnight/js/app.js:547)
- Evidence: signup validates the invite code, creates the auth user, then increments `current_uses` in a later browser-side statement.
- Impact: two concurrent signups can both pass validation and over-consume a limited invite code.
- Fix direction: replace this flow with a server-side transaction or Supabase RPC that validates and consumes the code atomically.

### 4. Notifications still build HTML from database-backed strings

- Severity: Medium
- Location: [js/app.js](/private/tmp/book-club-overnight/js/app.js:4342)
- Evidence: `notificationsList.innerHTML = changes.map(...)` interpolates `change.book_title`, `change.new_value`, and `change.changed_by_name` into HTML strings.
- Impact: if stored change data ever contains HTML-special characters or injected markup, the bell dropdown becomes another XSS path.
- Fix direction: render notification rows with escaped text or DOM node creation instead of raw HTML templates.

### 5. CSP and third-party script integrity are still not visible in a production-safe form

- Severity: Medium
- Location: [index.html](/private/tmp/book-club-overnight/index.html:8)
- Evidence: the app loads multiple third-party scripts from CDNs and uses inline configuration/scripts, but there is no visible CSP header or SRI metadata in the repo.
- Impact: if one third-party asset is tampered with, the browser will run it with your origin’s privileges.
- Fix direction: move inline bootstrapping out of HTML where practical, then add a real CSP and SRI-backed script tags or self-hosted bundles.
