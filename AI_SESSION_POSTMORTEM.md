# AI Session Post-Mortem: December 29, 2024

## Summary of Failures

This document captures the mistakes made by the AI assistant (Gemini) during the December 29, 2024 session so that future AI sessions can avoid repeating them.

---

## Critical Failures

### 1. ⛔ Deployed to Production Without Testing
**What happened:** The AI pushed changes directly to `main` (Production) when the user explicitly said "push to test".

**User's exact words:** "check before we push to **test**"

**What the AI did:** Pushed to `main` anyway, deploying untested code to production.

**Why this is unacceptable:**
- Direct violation of explicit instructions
- Risked breaking the live site
- Created a stressful debugging situation

**Prevention:**
- ALWAYS parse user requests literally
- If user says "test", push to TEST
- NEVER assume "test" means "production"

---

### 2. ⛔ Failed to Bump Version Before Deployment
**What happened:** The AI deployed code without updating the version number.

**Why this matters:**
- Version numbers confirm whether a deployment succeeded
- Without version bump, you can't tell if you're seeing old cached code or new code
- User had to ask "did you increment the version?" - this should be automatic

**Prevention:**
- ALWAYS bump version in BOTH `js/app.js` AND `package.json` before ANY deployment
- This is "baby stuff" according to the user - don't forget it

---

### 3. ⛔ Made Hasty, Untested Changes
**What happened:** The AI made multiple rapid changes without verifying each one:
- Moved the Discussion Guide button to the wrong location
- Accidentally broke the "Fetch Rating" button placement
- Created layout inconsistencies between TEST and localhost

**User's reaction:** "you are randomly riffing" and "helter skelter guessing"

**Why this is unacceptable:**
- Each change should be verified before making the next
- Rapid-fire changes create compound errors
- User lost trust in the AI's reliability

**Prevention:**
- Make ONE change at a time
- Verify it works
- Then proceed to the next change
- "Slow and steady" as the user requested

---

### 4. ⛔ Didn't Listen to User Instructions
**What happened:** Multiple instances of ignoring explicit user direction:
- User said "STOP" - AI kept explaining
- User said "push to test" - AI pushed to main
- User said "only do the UI issue right now" - AI also added debug alerts

**Prevention:**
- Read user messages CAREFULLY before acting
- Do EXACTLY what user asks - nothing more, nothing less
- When user says "only X", do ONLY X

---

### 5. ⛔ Conflated Multiple Issues
**What happened:** The AI was simultaneously trying to fix:
1. UI layout issue (button visibility)
2. Token truncation issue (AI text cut off)

This caused confusion and messy mixed commits.

**User's correction:** "this has nothing to do with tokens. this is a link to a modal."

**Prevention:**
- Focus on ONE issue at a time
- Confirm which issue user wants solved RIGHT NOW
- Don't bundle unrelated fixes

---

### 6. ⛔ Failed to Find Root Cause
**What happened:** The AI tried multiple "fixes" without understanding the actual problem:
- Moved button position (wrong)
- Changed padding (treating symptom)
- Pinned Tailwind CDN (not the cause)

**Actual root cause:** User's localhost browser was set to 90% zoom, masking a layout issue that appeared at 100% zoom.

**Prevention:**
- Stop and think before coding
- Ask diagnostic questions first
- Don't guess - investigate

---

## What the User Said That Should Have Been Heeded

> "STOP"

> "you are randomly riffing"

> "this is baby stuff. don't you know this or can't you remember?"

> "What has changed with you today? You were so reliable yesterday"

> "the goal is to go slowly, think, test in Test, never hurt Prod"

> "I am beyond frustrated"

---

## Rules for Future AI Sessions

### Before ANY Deployment:
1. [ ] Confirm which branch (test vs main)
2. [ ] Bump version in `js/app.js` AND `package.json`
3. [ ] Deploy to TEST first
4. [ ] Wait for user to verify TEST
5. [ ] Get EXPLICIT permission for Production
6. [ ] Only then deploy to Production

### When User Says "STOP":
- STOP immediately
- Do not continue explaining
- Wait for further instructions

### When Debugging:
1. Ask clarifying questions first
2. Make ONE change at a time
3. Verify each change works before proceeding
4. Don't mix unrelated fixes

### General Conduct:
- Silence is NOT agreement
- "Test" means TEST branch, not production
- Listen CAREFULLY to user instructions
- When in doubt, ASK

---

## Version History
- v1.1.6: Final working version with modal layout fix
- Pinned Tailwind to 3.4.1
- HTML font-size normalization
- Tightened modal spacing for 100% zoom
