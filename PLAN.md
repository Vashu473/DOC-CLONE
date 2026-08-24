# Ajaia Docs — implementation plan

Internal planning notes: scope cuts, order of work, and demo path. Reviewer materials are in `README.md`, `ARCHITECTURE.md`, `AI_WORKFLOW.md`, and `SUBMISSION.md`.

Goal: ship a strong working slice within a 4–6 hour timebox — not a full Google Docs clone.

---

## Requirements checklist

| Requirement | Approach |
|---|---|
| Create / rename / edit / save / reopen | Docs list + TipTap editor + database |
| Bold, italic, underline, headings, lists | TipTap toolbar (H1/H2 apply to selection size) |
| File upload (product-relevant) | Import `.txt` / `.md` into a new editable document |
| Owner + grant access + owned vs shared | Seeded users; share by email |
| Persist after refresh | Postgres (Docker locally, Neon in production) + TipTap JSON |
| README, live URL, errors, tests, architecture | Covered in the submission pack |
| AI workflow note + walkthrough video + Drive | Required assignment deliverables |

Evaluation focus: product judgment, full-stack execution, editor quality, upload and sharing, deployability, and clear tradeoffs.

---

## Locked decisions

1. **Next.js App Router + TypeScript + Tailwind** — one repo for UI and mutations; simple Vercel deploy.
2. **TipTap** — formatting toolbar ready; JSON stores lists and structure more reliably than HTML strings.
3. **Prisma + Postgres** — SQLite is allowed by the brief but awkward on serverless; Postgres matches production. Local: Docker Compose. Production: Neon free tier.
4. **Seeded cookie-session login** — no paid Auth0/Clerk. Alice, Bob, and Carol appear on the login screen.
5. **Share = editor access by email** — target user must exist. Unshare is owner-only.
6. **Import only** — `.txt` / `.md` become new docs. `.docx` and binary attachments are out of scope.
7. **No realtime, comments, versions, or PDF export.** Optional stretch if early: Markdown export.
8. **Autosave (~1s)** plus an explicit Save control, with clear status messaging.

---

## Work order

If time runs out, finish P0–P4 first, then import/share, tests, deploy, docs.

### P0 — This plan
Decisions, cuts, demo path, next 2–4 hours.

### P1 — Scaffold + data (~20 min)
Next.js, Prisma schema (`User`, `Document`, `DocumentShare`), seed users, `.env.example`.

### P2 — Auth (~30 min)
Login/logout, httpOnly cookie, protected routes, seeded credentials on the UI, bad-password errors.

### P3 — List + create/rename (~40 min)
Home: **Owned** vs **Shared with me**. New document, inline rename.

### P4 — Editor + persist (~70 min) — core depth
TipTap toolbar, JSON save, autosave, formatting survives refresh.

### P5 — Import + share (~75 min)
`.txt`/`.md` import; reject other types and oversized files in UI and server. Share modal, list tabs, authorization checks.

### P6 — Quality (~30 min)
Empty and error states. Vitest for access rules and markdown → TipTap JSON.

### P7 — Deploy (~30 min)
Vercel + `DATABASE_URL` + `SESSION_SECRET`, seed, smoke: login → share → refresh.

### P8 — Submission pack (~45 min)
README, ARCHITECTURE, AI_WORKFLOW, SUBMISSION, WALKTHROUGH.txt. Record and upload the walkthrough separately.

### P9 — Stretch only if early
Markdown export or unshare polish — not realtime collaboration.

---

## Explicit cuts

Realtime collaboration, comments, suggestions, version history, folders, `.docx`, enterprise ACL, paid auth, mobile-first polish, blob attachments on disk.

---

## Reviewer 10-minute path

1. Open the live URL  
2. Sign in as Alice → New document → format → save → refresh  
3. Import sample `.md`  
4. Share with `bob@ajaia.dev`  
5. Log out → Bob → **Shared with me** → open/edit  

**Demo accounts**

- `alice@ajaia.dev` / `demo1234` (owner)  
- `bob@ajaia.dev` / `demo1234` (shared-with)  
- `carol@ajaia.dev` / `demo1234` (no access)

---

## Authorization rule

Read/write only if the user is the **owner** or has a `DocumentShare` row. Otherwise treat as not found / forbidden.

---

## Walkthrough script (3–5 min)

1. Problem and scope cuts (30s)  
2. Alice: create, format, save, refresh (60s)  
3. Import `.md` (30s)  
4. Share → Bob Shared tab (60s)  
5. Stack choices: TipTap JSON, cookie auth, Postgres (30s)  
6. Deprioritized features and tooling notes (30–45s)

---

## Next 2–4 hours

`.docx` import (mammoth), viewer vs editor roles, Markdown/PDF export, presence indicator, version snapshots.

---

## Risks

- TipTap JSON save: verify create + refresh early  
- Vercel cookies: `secure` + `sameSite=lax`  
- Do not store uploads on serverless disk (keep imported text in the database)  
- Lock share + deploy before stretch features  
