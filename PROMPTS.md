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

## Prompt #15 — Implementing OTP email authentication

**Goal:** Turn the OTP concept (Prompt #12) into a working implementation using Resend.

**Prompt:**
> "yes now it works, so when the website is handed over to him i just have to paste his email address as the admin email, and he can log in?"

**Result:** Confirmed the handover flow. Built the full OTP system: `Otp` Prisma model, `src/lib/otpStore.ts` (`generateCode`, `saveOtp`, `verifyOtp`), `POST /api/auth/sendpassword` route that emails a 6-digit code via Resend, and NextAuth credentials provider that validates the code. `ADMIN_EMAIL` and `RESEND_FROM` added to `.env`.

**Notes:** Code expires after 10 minutes and is one-use. Resend `onboarding@resend.dev` address used for local dev; in production any verified domain address can be used.

---

## Prompt #16 — Deploying to Vercel

**Goal:** Get the project live on a public URL.

**Prompt:**
> "how can this link up with hosting on vercel"

**Result:** Step-by-step walkthrough: push to GitHub → import in Vercel dashboard → configure environment variables (`DATABASE_URL`, `ADMIN_EMAIL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`, `RESEND_FROM`) → deploy. Live URL: `cv-website-ruby-five.vercel.app`.

**Notes:** Three separate bugs surfaced during first deployment and were fixed across subsequent prompts (see #17–#19).

---

## Prompt #17 — Vercel build: serverActions config key

**Goal:** Fix a build failure caused by an unrecognised config key in `next.config.ts`.

**Prompt:**
> "[build log showing 'Unrecognized key(s) in object: serverActions']"

**Result:** Moved `serverActions: { bodySizeLimit: "10mb" }` under the `experimental` key. Next.js 16 requires server-action config under `experimental`, not at the top level.

**Notes:** Breaking change from earlier Next.js versions. Vercel's build output surfaced this before local builds did because local dev uses a different path.

---

## Prompt #18 — Vercel build: missing Prisma client

**Goal:** Fix a build failure where the generated Prisma client was absent on Vercel.

**Prompt:**
> "[build failure log — module not found @/generated/prisma]"

**Result:** Added `"postinstall": "prisma generate"` to `package.json`. Vercel runs `npm install` during builds, which triggers `postinstall` and regenerates the client. The `src/generated/` directory is gitignored, so it must be regenerated on the build server.

**Notes:** This is the standard pattern for any project using Prisma with gitignored generated files.

---

## Prompt #19 — Supabase max connections in production

**Goal:** Fix a runtime error where every page load threw `EMAXCONNSESSION: max clients reached`.

**Prompt:**
> "[runtime logs showing EMAXCONNSESSION error]"

**Result:** Changed `DATABASE_URL` in Vercel environment variables from port `5432` (session mode, max 15 connections) to port `6543` (transaction mode pooler, unlimited). Local `.env` stays on `5432`. Transaction mode pooler is designed for serverless environments where every request creates a new connection.

**Notes:** Critical gotcha for any Supabase + Vercel deployment. Session mode is fine locally; transaction mode is required in production.

---

## Prompt #20 — Design system implementation

**Goal:** Replace the placeholder styling with a professional CV design system delivered as a design handoff package.

**Prompt:**
> "[Design system zip attachment] inspect the newly added claude code handoff package from claude design, implement the new front end design as described."

**Result:** Full design system implemented: CSS custom property tokens for light and dark themes (`--cv-*`), `@theme inline` to bridge variables to Tailwind utilities, `ThemeProvider` context with localStorage persistence, `BackgroundLayer` (grid / equations / plain patterns), `ThemeToggle` buttons in the navbar, anti-flash inline script in `layout.tsx`, and `suppressHydrationWarning` on `<html>`. All shared admin UI classes added to `globals.css`.

**Notes:** The math equation background and grid backgrounds use pure CSS and SVG — no external images. Anti-flash pattern (inline script + suppressHydrationWarning) is required to prevent both visual flicker and React hydration warnings.

---

## Prompt #21 — Theme toggle buttons not visible

**Goal:** The three background-picker buttons (⊞ ∑ —) and theme toggle (☽/☀) were invisible or extremely faint.

**Prompt:**
> "i cant see the three buttons"

**Result:** Increased button size to 30×30px, added active state background (`cv-accent-soft`), added a vertical divider between the background pickers and the theme toggle, changed theme icons to ☽ (dark) / ☀ (light) for clarity.

**Notes:** The original color (`var(--cv-meta)`) was too close to the navbar background in both themes. Active state contrast is important on small icon buttons.

---

## Prompt #22 — Hydration mismatch on html element

**Goal:** Eliminate React console errors about a `data-theme` attribute mismatch between server and client.

**Prompt:**
> "[hydration mismatch error details showing data-theme attribute difference]"

**Result:** Added `suppressHydrationWarning` to the `<html>` tag in `layout.tsx`. The anti-flash inline script sets `data-theme` before React hydrates, so the attribute the browser sees differs from what the server rendered — `suppressHydrationWarning` tells React this is intentional.

**Notes:** This is the correct and documented pattern for theme systems that read from localStorage. The warning is cosmetic but confusing; suppressing it on `<html>` only is precise and safe.

---

## Prompt #23 — Dark mode broken in admin UI and login

**Goal:** Fix dark mode throughout all admin modals, manager components, and the login page, where text was invisible or illegible against dark backgrounds.

**Prompt:**
> "Lets fix the dark theme problem, make sure that text is contrasted from the dark background."

**Result:** Audited all six admin manager components and the login page. Replaced all hardcoded Tailwind gray classes with CSS variable references. Added ~20 shared admin CSS classes to `globals.css` (`.cv-input`, `.cv-btn-primary`, `.cv-btn-secondary`, `.cv-btn-edit`, `.cv-btn-delete`, `.cv-btn-add`, `.cv-btn-inline`, `.cv-display-card`, `.cv-card-title`, `.cv-empty-card`, `.cv-tag`, `.cv-badge-*`, `.cv-img-section`, `.cv-field-label`, `.cv-divider`). Rewrote all six components to use them.

**Notes:** The shared class approach avoids repeating CSS variable references in every component and makes future theme changes a single-file edit.

---

## Prompt #24 — Implementing soft deletes

**Goal:** Make deletions reversible so the admin cannot accidentally destroy content permanently.

**Prompt:**
> "how would i go about making soft deletes a real implementation"

**Result:** Added `deletedAt DateTime?` to all five content models in `schema.prisma`. Ran `prisma migrate dev --name add-soft-deletes`. All `delete*` server actions now do `update({ data: { deletedAt: new Date() } })` instead of hard deletes. All `findMany` queries gained `where: { deletedAt: null }`. Added `restore*` server actions and a `permanentlyDelete` action. Built `/admin/trash` page (admin-only, redirects visitors) with a `TrashManager` component showing all soft-deleted items sorted by deletion date, each with Restore and Delete Forever buttons. Added Trash link to the navbar for logged-in admins.

**Notes:** Soft deletes are the standard pattern for content management systems. The trash page makes the feature discoverable without cluttering the main UI.

---

## Prompt #25 — Mobile navbar optimisation

**Goal:** Fix the navbar on small screens where the name was getting crushed and all the links overflowed.

**Prompt:**
> "The app is now almost finished, we only need to optimalize it for phone view aswell, the main issue with the phone version is that the navbar is to long for the screen, and that the title name in the left upper corner gets pressed in a way. make it so that the navbar is slide-able, instead of being glued to the whole screen."

**Result:** Redesigned navbar for mobile: two-row layout. Top row keeps the site name (muted gray, `text-sm`) and auth/theme controls. All nav links move to a second row that is horizontally scrollable (`overflow-x: auto`, `w-max` inner container). Scrollbar hidden via `.cv-nav-scroll` CSS class with `-webkit-overflow-scrolling: touch` for smooth iOS momentum. Desktop layout unchanged (single row, `sm:hidden` / `hidden sm:flex` breakpoints). First PR opened for the project using the feature branch workflow.

**Notes:** Chose a scrollable strip over a hamburger menu to keep the navbar as a pure Server Component — no client-side toggle state needed. The `w-max` trick on the inner `<nav>` is the key: it makes the nav as wide as its content while the outer container clips to the viewport.

---

## Prompt #26 — Vercel build error: /_not-found prerender

**Goal:** Fix a Vercel build failure where the 404 page crashed because Prisma tried to connect to a database that doesn't exist at build time.

**Prompt:**
> "[Vercel error: driverAdapterError: DatabaseNotReachable — Export encountered an error on /_not-found/page]"

**Result:** Added `export const dynamic = "force-dynamic"` to `src/app/layout.tsx`. This opts every page — including the special `/_not-found` route — out of static prerendering, so Prisma is only called at request time when a real database connection is available.

**Notes:** All content pages already had `force-dynamic` individually, but the root layout (and the `/_not-found` page it wraps) did not. The error only appeared on Vercel because local builds skip static generation when a live DB is reachable.

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
