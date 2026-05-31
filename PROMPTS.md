# Prompt Log

Tracks all significant prompts used during development of this project.
Included to demonstrate prompting approach as part of the evaluation criteria.

---

## Template

```
## Prompt #N — [Short title]

**Goal:** What I was trying to achieve and why.

**Prompt:**
> "Exact prompt text here."

**Result:** What was produced (file, feature, fix). Link to file if relevant.

**Notes:** Any follow-ups, iterations, or decisions made. What I changed and why.
```

---

## Prompt #1 — Project prompt tracking setup

**Goal:** Establish a system to track all prompts throughout the project so the evaluator can assess prompting skills alongside code output.

**Prompt:**
> "Im making a test project for a company. the main objective is for them to evaluate my skills including tech stack, UI/UX, customization and how i prompt. What is the best way to keep track of all prompts in this project"

**Result:** This file — `PROMPTS.md` in the project root.

**Notes:** Chose a flat markdown file over a separate `docs/` folder to keep it immediately visible. Format captures goal, exact prompt, result, and iteration notes so the evaluator can see both the prompt quality and the reasoning behind it.

---

## Prompt #2 — Dev server preferences

**Goal:** Set a persistent rule so Claude never starts the dev server on my behalf.

**Prompt:**
> "For the rest of this project, do not launch the website yourself, let me run it"

**Result:** Saved to project memory. Claude no longer starts the server.

**Notes:** Useful to establish workflow preferences early so they persist across sessions.

---

## Prompt #3 — Mac lagging on localhost

**Goal:** Diagnose why the Mac was becoming unresponsive every time the dev server started.

**Prompt:**
> "why does my mac keep crashing every time i want to launch the website through localhost:3000"

**Result:** Identified that a stray `package-lock.json` at `~/package-lock.json` was causing Turbopack to watch the entire home directory for file changes. Fixed by deleting the orphaned files and setting `turbopack.root` in `next.config.ts`.

**Notes:** Root cause was accidentally running `npm install` from `~` instead of the project directory.

---

## Prompt #4 — Prisma client not generated

**Goal:** Resolve a build error where the generated Prisma client was missing.

**Prompt:**
> "[Module not found: Can't resolve '@/generated/prisma']"

**Result:** Ran `npx prisma generate`. Fixed the import path from `@/generated/prisma` to `@/generated/prisma/client` — Prisma 7 changed the entry point to `client.ts`.

**Notes:** Prisma 7 is a breaking change from earlier versions. The generated file structure changed and the import path must be explicit.

---

## Prompt #5 — PrismaClient constructor error

**Goal:** Fix a runtime error where `PrismaClient` refused to initialise without options.

**Prompt:**
> "[PrismaClientInitializationError: PrismaClient needs to be constructed with a non-empty, valid PrismaClientOptions]"

**Result:** Installed `@prisma/adapter-pg` and `pg`, updated `src/lib/prisma.ts` to pass a `PrismaPg` driver adapter with the `DATABASE_URL` connection string.

**Notes:** Prisma 7 requires an explicit driver adapter — it no longer auto-reads `DATABASE_URL` from the environment. Significant breaking change from Prisma 6.

---

## Prompt #6 — Admin and visitor experience

**Goal:** Replace the separate admin panel with inline editing directly on the public-facing pages.

**Prompt:**
> "we now have to configure the admin / visitor experiences. After a successful login, all of the pages should be open to edit, not just from an admin panel."

**Result:** Built server actions for all four models, a reusable `Modal` component, and four Manager client components. Each public page checks session server-side and passes `isAdmin` to the manager. Login redirects to `/` instead of `/admin`.

**Notes:** Chose modal forms over inline editing for clarity. Server actions protect mutations via `requireAdmin()` even if the UI is bypassed.

---

## Prompt #7 — Understanding the data flow

**Goal:** Understand how edits made on the site travel to the database and back.

**Prompt:**
> "explain the flow for me: When an edit is done to the research/publications/algorithms or any of the sites, how does this talk to the backend? does the data get stored, what is stored? is the data stored by following the prisma schemas i created?"

**Result:** Explanation of the full stack flow: form → server action → `requireAdmin()` → Prisma SQL → PostgreSQL → `revalidatePath` → page re-render.

**Notes:** Confirmed that the Prisma schema is the contract for what gets stored and how.

---

## Prompt #8 — Type of programming pattern

**Goal:** Understand what architectural pattern is being used.

**Prompt:**
> "what is this type of programming called? OOP?"

**Result:** Explained MVC (Model-View-Controller) as the closest match. Clarified that OOP describes how code is written, not how an app is structured.

---

## Prompt #9 — Hosting on Vercel

**Goal:** Understand how to deploy the project to a live URL.

**Prompt:**
> "how do i host this on vercel or something else like that"

**Result:** Step-by-step guide: push to GitHub → import to Vercel → set environment variables → deploy.

**Notes:** Noted that the database must be accessible from the internet before deploying. Supabase already handles this.

---

## Prompt #10 — Four-feature expansion

**Goal:** Expand the site with site-wide settings, contact page editing, a standalone algorithms section, and removal of the admin panel.

**Prompt:**
> "there are a few things we need to fix: (1) the title/name needs to be able to change (2) contact page needs the same treatment (3) remove the admin page, just make it say log in (4) algorithms-section needs to be dissociated from the research site"

**Result:** Added three new Prisma models (`SiteSettings`, `ContactInfo`, `Algorithm`), server actions for each, and three new Manager components. Navbar updated. `/admin` redirects to `/`. Algorithms has its own independent table.

**Notes:** `SiteSettings` and `ContactInfo` use `upsert` with `id = "main"` since they are single-row config tables, not lists.

---

## Prompt #11 — Database security and soft deletes

**Goal:** Understand whether a malicious user with the password could destroy all data, and how to protect against it.

**Prompt:**
> "can the user affect the database in any other way than adding or removing things... i would like to change this, is it possible to add some sort of security layer on top of the database?"

**Result:** Explained soft deletes, data export, Supabase backups, and rate limiting. Recommended soft deletes + Supabase backups. Implementation deferred.

---

## Prompt #12 — OTP email authentication concept

**Goal:** Replace static password login with a one-time code sent to the admin's email.

**Prompt:**
> "is it possible to send a password to the email linked to the site? first its needed to add/link an email to this site, then they get an admin password, every time they want to log in they have to write the correct email, then they get a password that they can use to log in"

**Result:** Confirmed it is possible using OTP authentication. Outlined the flow: email entry → OTP generated → sent via Resend → code verified → session created. Implementation deferred.

---

## Prompt #13 — Profile picture and background image upload

**Goal:** Allow the admin to upload a profile picture and a page background image from the site settings modal.

**Prompt:**
> "In the site settings manager add the following: A possibility to change profile picture, do this using input type=file so the user can upload an image-file, make it compatible with the most common types, then do the same for the background, if no background or profile picture is uploaded keep the current template as a basis, also add a reset button"

**Result:** Added `profileImage` and `backgroundImage` fields to `SiteSettings`. Created `/api/images/[type]` route to serve images as binary. Raised server action body size limit to 10MB. Updated `SiteSettingsManager` with file pickers, previews, remove buttons, and a reset button. Profile image shown in hero; background applied site-wide via layout.

**Notes:** Images stored as base64 in PostgreSQL, served through an API route to keep HTML small. Uses a `"keep"` sentinel so unchanged images are never re-sent.

---

## Prompt #14 — Login page linked to SiteSettings

**Goal:** Make the name and role on the login page dynamic instead of hardcoded.

**Prompt:**
> "in the login site, link the name to the site setting input name, do the same with title and any other hard coded things about the user, do not change any hard coded titles for the different pages accessible through the navbar"

**Result:** Split `login/page.tsx` into a server component (fetches `SiteSettings`) and `LoginClient.tsx` (receives `name` and `role` as props). Page-specific titles left hardcoded.

**Notes:** The server/client split pattern is consistent with how all other pages in the project work.

---
