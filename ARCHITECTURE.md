# Architecture

## Product slice

Ajaia asked for a Google Docs–inspired internal editor under a 4–6 hour cap. The product is **Ajaia Docs**: one coherent path (create → format → save → import → share → reopen as another user), not a surface-area clone.

## What we prioritized

1. **Editing quality** — TipTap with a real toolbar and JSON persistence so headings/lists survive refresh.
2. **Access logic** — owner vs share row checked on every read/write, plus a visible Owned / Shared split.
3. **Import as a product action** — files become editable docs (how teams actually start drafts).
4. **Shipability** — seeded login, Postgres, Vercel, no paid reviewer dependency.

## What we cut (on purpose)

Realtime/CRDT, comments, suggestions, history, folders, `.docx`, enterprise ACL, attachments on disk, paid auth. Stretch if time: Markdown export or richer roles — not Yjs.

## Stack

```
Browser (App Router pages + TipTap)
  → Server Actions (auth, CRUD, share, import)
  → Prisma
  → Postgres (Docker locally, Neon in production)
```

- **Next.js** — one repo for UI + mutations; Vercel is the default deploy.
- **TipTap JSON** in `Document.content` — more reliable than storing HTML for lists/headings.
- **Cookie session** (HMAC) — two seeded users; no Clerk/Auth0 invoice.
- **Prisma + Postgres** — SQLite is allowed by the brief but painful on serverless; Postgres matches production.

## Data model

- `User` — email, name, password hash
- `Document` — title, TipTap JSON, `ownerId`
- `DocumentShare` — unique `(documentId, userId)`, role `editor`

Authorization: access if `userId === ownerId` **or** a share row exists. Only the owner can share, unshare, or delete.

## File import

Supported: `.txt`, `.md` / `.markdown`, 1 MB cap. Markdown is parsed into TipTap nodes (headings, bullets, ordered lists, light bold/italic). Other types are rejected in the UI and on the server. Import creates a **new** document rather than attaching a blob (Vercel has no durable local disk).

## Autosave

Client debounce ~900ms plus an explicit Save. Status: Saved / Saving / Unsaved / Save failed.

## Tests

Pure functions, not page snapshots:

- `tests/access.test.ts` — owner/share deny/allow
- `tests/import-markdown.test.ts` — heading + list JSON, type reject

## If we had 2–4 more hours

`.docx` via mammoth, viewer vs editor roles, Markdown/PDF export, a couple of document versions, basic “someone else has this open” indicator (not full collab).
