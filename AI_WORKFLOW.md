# AI workflow note

## Tools

- **Cursor (Grok 4.6)** for scaffolding, TipTap wiring, Prisma schema, tests, and copy.
- **Human judgment** for scope cuts, share model, file-type choice, demo accounts, and what *not* to build.

## Where AI sped things up

- Next.js + Prisma + TipTap boilerplate and toolbar wiring
- Markdown → TipTap JSON parser and Vitest cases
- Seed script and reviewer-oriented README structure

## What we changed or rejected

- Rejected realtime / Yjs and comment threads (stretch that would starve the core).
- Rejected `.docx` import as a first file type (XML complexity vs timebox).
- Rejected storing uploads on the serverless filesystem.
- Rejected paid auth providers (assignment: reviewers must not pay).
- Tightened the markdown parser after an early consecutive-list bug (flush-on-every-bullet).
- Pinned **Prisma 6** instead of 7 (driver adapters would burn time).

## How we verified

- `npm test` — access rules + import JSON
- Manual path: Alice create/format/save/refresh → import `.md` → share Bob → Bob **Shared with me**
- Unsupported file type shows an error
- Unknown share email is rejected with a seeded-account hint
- Production: live URL login + share + refresh (see `SUBMISSION.md`)

We used AI as an accelerator, not as the owner of product or authz decisions.
