# Submission

## Included

- Source code (this repository)
- [`README.md`](README.md) — local setup and run instructions
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — priorities and deliberate cuts
- [`AI_WORKFLOW.md`](AI_WORKFLOW.md) — how assistive tooling was used and verified
- [`WALKTHROUGH.txt`](WALKTHROUGH.txt) — walkthrough video URL
- [`PLAN.md`](PLAN.md) — implementation plan (optional for reviewers)
- [`public/sample-import.md`](public/sample-import.md) — sample import file
- Automated tests: `npm test`

## Live product URL

- App: https://doc-clone-eta.vercel.app
- Login: https://doc-clone-eta.vercel.app/login
- Source: https://github.com/Vashu473/DOC-CLONE

## Reviewer credentials

- `alice@ajaia.dev` / `demo1234` — owner
- `bob@ajaia.dev` / `demo1234` — shared-with
- `carol@ajaia.dev` / `demo1234` — unrelated (should not see Alice’s unshared docs)

Seeded document: **Welcome to Ajaia Docs** (owned by Alice, already shared with Bob).

## How to run locally

See [`README.md`](README.md): Docker Postgres on port 5433, `npm run db:setup`, `npm run dev`.

## What is working

- Auth, document CRUD, TipTap editing, autosave, persistence after refresh
- Import `.txt` / `.md` (max 1 MB)
- Share / unshare, Owned vs Shared with me, server-side access checks
- Validation errors (bad login, unknown share email, bad file type)
- Automated tests for access and markdown import

## What is incomplete

- Walkthrough video URL must be pasted into `WALKTHROUGH.txt` and the assignment portal
- Google Drive folder upload is manual
- Live app URL: https://doc-clone-eta.vercel.app

## What I would build next (2–4 hours)

- `.docx` import (mammoth)
- Viewer vs editor roles
- Markdown export
- Named versions / restore

## Intentionally not built

Realtime collaboration, comments, suggestion mode, folders, paid auth, binary attachments.
