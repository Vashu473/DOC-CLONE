# Ajaia Docs

Lightweight collaborative documents for the Ajaia LLC AI-Native Full Stack take-home. Not a Google Docs clone: create, edit, import, share, persist.

## Demo accounts (reviewers)

| Email | Password | Role |
|---|---|---|
| `alice@ajaia.dev` | `demo1234` | Owner |
| `bob@ajaia.dev` | `demo1234` | Shared-with |

A seeded doc **Welcome to Ajaia Docs** is owned by Alice and already shared with Bob.

## Live product

See [`SUBMISSION.md`](SUBMISSION.md).

Production path: **Vercel + Neon** (free). This workspace was not logged into Vercel, so you still need:

```bash
npx vercel login
npx vercel
# In the dashboard: set DATABASE_URL (Neon) and SESSION_SECRET
npx vercel --prod
DATABASE_URL="postgresql://..." npx prisma db push
DATABASE_URL="postgresql://..." npx prisma db seed
```

Then paste the `*.vercel.app` URL into `SUBMISSION.md` and the assignment portal.

## What works

- Login with seeded users (httpOnly session cookie)
- Create, rename, delete (owner), edit rich text
- Bold, italic, underline, H1/H2, bullets, numbered lists
- Autosave + Save now; content stored as TipTap JSON
- Import `.txt` / `.md` (max 1 MB) into a **new** document
- Share by email with an existing user (editor access); unshare
- **Owned** vs **Shared with me** lists
- Refresh keeps documents, formatting, and shares

**Not supported:** `.docx`, realtime collab, comments, version history, PDF export, viewer-only role.

## Local setup

Need **Node 20+** and **Docker** (Postgres on host port **5433** so it does not clash with a local Postgres on 5432). Alternatively point `DATABASE_URL` at a free [Neon](https://neon.tech) project.

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:setup
npm run dev
```

Open http://localhost:3000

`.env` keys:

- `DATABASE_URL` — Postgres connection string
- `SESSION_SECRET` — 16+ character secret (use a long random value in production)

## Tests

```bash
npm test
```

Covers share access rules and markdown → TipTap import.

## Deploy (Vercel + Neon)

1. Create a free Neon database. Copy the connection string.
2. `npx vercel` (or connect the Git repo in the Vercel dashboard).
3. Set env vars: `DATABASE_URL`, `SESSION_SECRET` (long random).
4. Deploy. Then seed production once:

```bash
DATABASE_URL="your-neon-url" npx prisma db push
DATABASE_URL="your-neon-url" npx prisma db seed
```

Reviewers do not need paid accounts.

## Sample import file

[`public/sample-import.md`](public/sample-import.md)
