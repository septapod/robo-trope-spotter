---
date: 2026-03-30
topic: admin-dashboard
---

# Admin Dashboard

## Problem Frame
The site owner needs to see all reports generated, monitor usage volume, and find old reports by browsing.

## Requirements
- R1. Admin page at /admin, protected by a single password (stored as ADMIN_PASSWORD env var)
- R2. Password entry on first visit, stored in a session cookie so you don't re-enter every page load
- R3. List all reports, newest first: slug, input type, score, label, word count, created date
- R4. Each row links to the report page (/report/[slug])
- R5. Show total report count and today's count at the top

## Scope Boundaries
- No user accounts, no roles, no multi-admin
- No ability to delete or edit reports from the admin page (view only)
- No analytics charts (just the list and counts)
