# Ajaia Docs — internal plan (Hinglish)

Yeh file **tumhare liye** hai: kaise parts split kiye, kaunsi decision kyun li. Reviewer Drive packet ke liye alag files hain (`README`, `ARCHITECTURE`, `AI_WORKFLOW`, `SUBMISSION`).

Google Docs clone nahi banana. 4–6 hour mein **ek strong working slice** ship karna hai.

---

## Assignment kya maang raha hai (checklist)

| Requirement | Hum kya kar rahe hain |
|---|---|
| Create / rename / edit / save / reopen | Docs list + TipTap editor + DB |
| Bold, italic, underline, headings, lists | TipTap toolbar |
| File upload (product-relevant) | `.txt` / `.md` import → naya editable doc |
| Owner + grant access + owned vs shared | Seeded Alice/Bob, share by email |
| Persist after refresh | Postgres (local Docker ya Neon) + TipTap JSON |
| README, live URL, errors, 1 test, architecture | P6–P8 |
| AI note + 3–5 min video + Drive + SUBMISSION | Docs pack; video/Drive tum record/upload |

Evaluator dekh raha hai: **product judgment**, full stack, editor quality, upload + share, deploy, tradeoffs, AI without outsourcing judgment.

---

## Locked decisions (kyun)

1. **Next.js App Router + TypeScript + Tailwind** — ek repo, UI + API, Vercel pe 10 min deploy.
2. **TipTap** — bold/italic/underline/H1/H2/lists ready; JSON schema lists/headings ke liye HTML string se better.
3. **Prisma + Postgres** — assignment allow karta hai SQLite/Postgres. Vercel pe SQLite file unreliable hai, isliye Postgres. Local: Docker Compose. Prod: Neon free (reviewer pay nahi karta).
4. **Seeded login (cookie session)** — Auth0/Clerk skip. Constraint: koi paid service mat maango. Alice + Bob login screen pe dikhe.
5. **Share = editor access by email** — user DB mein hona chahiye. Viewer role stretch. Unshare owner-only (small, demo-friendly).
6. **Import only, attachments nahi** — `.txt`/`.md` → naya doc. `.docx` skip (Word XML heavy). Binary attach skip (serverless disk + blob extra time).
7. **No realtime / comments / versions / PDF.** Stretch agar core complete: Markdown export.
8. **Autosave ~1s** + Saved / Saving / Unsaved — editor usable lage, Google Docs jaisa feel without collab.

---

## Parts (isi order mein kaam)

Time khatam ho to **P0–P4 pehle**, phir import/share, test, deploy, docs. Stretch last.

### P0 — Yeh PLAN.md
Decisions, split, cuts, demo path, next 2–4 hours.

### P1 — Scaffold + data (~20 min)
Next.js, Prisma schema (`User`, `Document`, `DocumentShare`), seed Alice/Bob, `.env.example`.

### P2 — Auth (~30 min)
Login/logout, httpOnly cookie, protected routes, seeded creds UI pe, galat password error.

### P3 — List + create/rename (~40 min)
Home: **Owned** vs **Shared with me**. New document, inline rename.

### P4 — Editor + persist (~70 min) — **core depth**
TipTap toolbar, JSON save, autosave, refresh ke baad wahi formatting. Yahi “editing quality” hai.

### P5 — Import + share (~75 min)
`.txt`/`.md` import; dusri type / size limit reject + UI copy. Share modal, tabs, authz: Bob unshared doc pe nahi ghus sakta.

### P6 — Quality (~30 min)
Empty/error states. Vitest: access helper + markdown → TipTap JSON. Snapshot-only test nahi.

### P7 — Deploy (~30 min)
Vercel + `DATABASE_URL` + `SESSION_SECRET`, seed, live smoke: login → share → refresh.

### P8 — Submission pack (~45 min)
README, ARCHITECTURE, AI_WORKFLOW, SUBMISSION (working / incomplete / next 2–4h), WALKTHROUGH.txt. Loom + Drive **tum** karoge.

### P9 — Stretch only if early
Markdown export **ya** unshare polish. Yjs/realtime nahi.

---

## Explicit cuts (video + ARCHITECTURE mein bolo)

Realtime collab, comments, suggestions, version history, folders, `.docx`, enterprise ACL, paid auth, mobile-first polish, file attachments as blobs.

---

## Reviewer 10-min path (README + video same)

1. Live URL kholo  
2. Alice login → New doc → format → save → refresh  
3. Import sample `.md`  
4. Share `bob@ajaia.dev`  
5. Logout → Bob → **Shared with me** → open/edit  

**Demo accounts**

- `alice@ajaia.dev` / `demo1234` (owner)  
- `bob@ajaia.dev` / `demo1234` (shared-with)

---

## Authz rule (ek line)

Read/write tabhi: user **owner** hai **ya** `DocumentShare` row hai. Warna 403.

---

## Video script (3–5 min) — record ke time

1. Problem + scope cut (30s)  
2. Alice: create, format, save, refresh (60s)  
3. Import `.md` (30s)  
4. Share → Bob Shared tab (60s)  
5. Stack + TipTap JSON + cookie auth (30s)  
6. Deprioritized + AI usage (30–45s)

---

## Next 2–4 hours (agar time bache / SUBMISSION mein)

`.docx` import (mammoth), viewer vs editor roles, Markdown/PDF export, presence indicator, version snapshots.

---

## Risks (yaad rakhna)

- TipTap JSON save: pehle create + refresh verify  
- Vercel cookies: `secure` + `sameSite=lax`  
- Uploads serverless disk pe mat rakhna (import text ko DB mein daalo)  
- Stretch se pehle share + deploy lock karo  
