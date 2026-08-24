# Architecture

## Product slice

Ajaia asked for a Google Docs–inspired internal editor under a 4–6 hour cap. **Ajaia Docs** is one coherent path (create → format → save → import → share → reopen as another user), not a surface-area clone.

## What was prioritized

1. **Editing quality** — TipTap with a real toolbar and JSON persistence so formatting survives refresh. H1/H2 scale the selected text (like bold), not the entire document block.
2. **Access logic** — owner vs share row checked on every read/write, plus a visible Owned / Shared split.
3. **Import as a product action** — files become editable docs (how teams often start drafts).
4. **Shipability** — seeded login, Postgres, Vercel, no paid dependency for reviewers.

## What was cut on purpose

Realtime/CRDT, comments, suggestions, history, folders, `.docx`, enterprise ACL, attachments on disk, paid auth. Stretch if time remains: Markdown export or richer roles — not realtime sync.

## Stack

```
Browser (App Router pages + TipTap)
  → Server Actions (auth, CRUD, share, import)
  → Prisma
  → Postgres (Docker locally, Neon in production)
```

- **Next.js** — one repo for UI and mutations; Vercel is the default deploy path.
- **TipTap JSON** in `Document.content` — more reliable than storing HTML for lists and structure.
- **Cookie session** (HMAC) — seeded demo users; no Clerk/Auth0 invoice.
- **Prisma + Postgres** — SQLite is allowed by the brief but awkward on serverless; Postgres matches production.

## Data model

- `User` — email, name, password hash
- `Document` — title, TipTap JSON, `ownerId`
- `DocumentShare` — unique `(documentId, userId)`, role `editor`

Authorization: access if `userId === ownerId` **or** a share row exists. Only the owner can share, unshare, or delete.

## File import

Supported: `.txt`, `.md` / `.markdown`, 1 MB cap. Markdown is parsed into TipTap nodes (headings, bullets, ordered lists, light bold/italic). Other types are rejected in the UI and on the server. Import creates a **new** document rather than attaching a blob (no durable local disk on Vercel).

## Autosave

Client debounce ~1s plus an explicit Save control. Status: saved / saving / unsaved / error, with a clear control label.

## Tests

Focused unit tests, not page snapshots:

- `tests/access.test.ts` — owner / share allow and deny
- `tests/import-markdown.test.ts` — heading + list JSON, type reject
- `tests/document-rules.test.ts` — title and share validation
- `tests/db-persistence.test.ts` — local Postgres persistence when available
- `e2e/` — short Playwright smoke (login, create, 404)

## If another 2–4 hours were available

`.docx` via mammoth, viewer vs editor roles, Markdown/PDF export, a couple of document versions, a basic presence indicator (not full collaboration).
