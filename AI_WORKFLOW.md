# AI workflow note

This project used a coding assistant inside the IDE as a productivity aid. Product scope, architecture choices, and final verification were owned by the engineer.

## Tools used

- Cursor IDE assistant for boilerplate, TipTap editor wiring, Prisma schema drafts, and test stubs
- Manual review and edits on every generated suggestion before it shipped

## Where assistance helped

- Faster scaffolding of Next.js routes, Prisma models, and the TipTap toolbar
- First draft of the markdown → TipTap JSON parser and unit tests
- Structuring README / architecture notes so reviewers can run the app quickly

## What was changed or rejected

- Rejected realtime / Yjs and comment threads (would have starved the core slice)
- Rejected `.docx` as the first import format (XML cost vs timebox)
- Rejected writing uploads to the serverless filesystem
- Rejected paid auth providers so reviewers need no paid accounts
- Fixed an early markdown list-parsing bug after review (flush consecutive lists correctly)
- Stayed on Prisma 6 instead of upgrading to Prisma 7 mid-build (adapter churn)

## How correctness was verified

- `npm test` for access control and import parsing
- Manual flow: Alice create → format → save → refresh → import `.md` → share with Bob → Bob opens **Shared with me**
- Error paths: unsupported file type, unknown share email, unauthorized document URL
- Production smoke on the live Vercel URL (see `SUBMISSION.md`)

Assistive tooling did not replace judgment on what to ship, what to cut, or how sharing and persistence should work.
