---
description: Verify Before Push deployment workflow
---
# Deployment Workflow

You MUST follow these steps exactly. Combining steps is a CRITICAL FAILURE.

1. **Validation:** Ask user to verify on `localhost:8080`. (Wait for approval)
2. **Versioning:** Bump version in `app.js` and `package.json`.
3. **Commit:** `git add .` and `git commit` (NO PUSH YET).
4. **Push to TEST:** `git push origin test`.
5. **Human Login:** Ask USER to log in to the TEST site.
6. **Verify TEST:** Run browser tests ONLY after user confirms they are logged in.
7. **PROD Approval:** Ask for explicit permission to merge to `main`.
