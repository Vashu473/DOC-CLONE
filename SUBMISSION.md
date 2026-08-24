# Submission

## Included

- Source code (this repo)
- [`README.md`](README.md) — local setup and run
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — priorities and cuts
- [`AI_WORKFLOW.md`](AI_WORKFLOW.md) — how AI was used
- [`WALKTHROUGH.txt`](WALKTHROUGH.txt) — video URL (paste Loom/YouTube here)
- [`PLAN.md`](PLAN.md) — internal Hinglish split (not required by reviewers)
- [`public/sample-import.md`](public/sample-import.md) — sample import file
- Automated tests: `npm test`

## Live product URL

**Preferred (reviewers):** Vercel + Neon — this machine was not logged into Vercel/Neon, so run the deploy steps in README once, then paste the `*.vercel.app` URL here.

**Session tunnel (only while this PC is on):** https://page-range-considered-rainbow.trycloudflare.com

Do not submit the tunnel URL as the assignment live link unless you keep the machine and `npm run dev` running. Use Vercel for the Drive/portal submission.

## Reviewer credentials

- `alice@ajaia.dev` / `demo1234` — owner
- `bob@ajaia.dev` / `demo1234` — shared-with

Seeded document: **Welcome to Ajaia Docs** (Alice owns, already shared with Bob).

## How to run locally

See [`README.md`](README.md): Docker Postgres on port 5433, `npm run db:setup`, `npm run dev`.

## What is working

- Auth, document CRUD, TipTap editing, autosave, persist after refresh
- Import `.txt` / `.md` (max 1 MB)
- Share / unshare, Owned vs Shared with me, server-side access checks
- Validation errors (bad login, unknown share email, bad file type)
- Tests for access + markdown import

## What is incomplete

- Live URL must be filled after Vercel + Neon env + seed
- Walkthrough video URL must be pasted into `WALKTHROUGH.txt` and the assignment portal
- Google Drive zip/folder is a manual upload

## What I would build next (2–4 hours)

- `.docx` import (mammoth)
- Viewer vs editor roles
- Markdown export
- A couple of named versions / restore

## Intentionally not built

Realtime collaboration, comments, suggestion mode, folders, paid auth, binary attachments.
