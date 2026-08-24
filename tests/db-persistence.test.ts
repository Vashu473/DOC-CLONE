import { afterAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { emptyDoc } from "../lib/import-file";
import { canAccessDocument } from "../lib/permissions";
import { DEFAULT_TITLE } from "../lib/document-rules";

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return "";
  const line = readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .find((row) => row.startsWith("DATABASE_URL="));
  if (!line) return "";
  return line.slice("DATABASE_URL=".length).replace(/^["']|["']$/g, "").trim();
}

const url = databaseUrl();
const isLocal =
  url.includes("127.0.0.1") ||
  url.includes("localhost") ||
  process.env.RUN_DB_TESTS === "1";

const describeDb = isLocal ? describe : describe.skip;

const prisma = new PrismaClient();
const prefix = `qa-${Date.now()}`;

describeDb("5/7 persistence + share against Postgres", () => {
  afterAll(async () => {
    await prisma.document.deleteMany({
      where: { title: { startsWith: prefix } },
    });
    await prisma.$disconnect();
  });

  it("creates isolated documents that do not mix content", async () => {
    const alice = await prisma.user.findUnique({
      where: { email: "alice@ajaia.dev" },
    });
    if (!alice) throw new Error("Seed Alice first: npm run db:seed");

    const a = await prisma.document.create({
      data: {
        title: `${prefix}-A`,
        ownerId: alice.id,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "alpha-only" }],
            },
          ],
        },
      },
    });
    const b = await prisma.document.create({
      data: {
        title: `${prefix}-B`,
        ownerId: alice.id,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "beta-only" }],
            },
          ],
        },
      },
    });

    const againA = await prisma.document.findUnique({ where: { id: a.id } });
    const againB = await prisma.document.findUnique({ where: { id: b.id } });
    expect(JSON.stringify(againA?.content)).toContain("alpha-only");
    expect(JSON.stringify(againB?.content)).toContain("beta-only");
    expect(JSON.stringify(againA?.content)).not.toContain("beta-only");
  });

  it("renames persist after a fresh read", async () => {
    const alice = await prisma.user.findUniqueOrThrow({
      where: { email: "alice@ajaia.dev" },
    });
    const doc = await prisma.document.create({
      data: {
        title: DEFAULT_TITLE,
        ownerId: alice.id,
        content: emptyDoc,
      },
    });
    await prisma.document.update({
      where: { id: doc.id },
      data: { title: `${prefix}-renamed` },
    });
    const again = await prisma.document.findUniqueOrThrow({
      where: { id: doc.id },
    });
    expect(again.title).toBe(`${prefix}-renamed`);
  });

  it("upsert share does not duplicate rows; Carol stays unauthorized", async () => {
    const alice = await prisma.user.findUniqueOrThrow({
      where: { email: "alice@ajaia.dev" },
    });
    const bob = await prisma.user.findUniqueOrThrow({
      where: { email: "bob@ajaia.dev" },
    });
    const carol = await prisma.user.findUnique({
      where: { email: "carol@ajaia.dev" },
    });

    const doc = await prisma.document.create({
      data: {
        title: `${prefix}-share`,
        ownerId: alice.id,
        content: emptyDoc,
      },
    });

    await prisma.documentShare.upsert({
      where: { documentId_userId: { documentId: doc.id, userId: bob.id } },
      update: { role: "editor" },
      create: { documentId: doc.id, userId: bob.id, role: "editor" },
    });
    await prisma.documentShare.upsert({
      where: { documentId_userId: { documentId: doc.id, userId: bob.id } },
      update: { role: "editor" },
      create: { documentId: doc.id, userId: bob.id, role: "editor" },
    });

    const shares = await prisma.documentShare.findMany({
      where: { documentId: doc.id },
    });
    expect(shares).toHaveLength(1);

    const loaded = await prisma.document.findUniqueOrThrow({
      where: { id: doc.id },
      include: { shares: true },
    });
    const shareIds = loaded.shares.map((s) => s.userId);
    expect(
      canAccessDocument({
        userId: bob.id,
        ownerId: alice.id,
        shareUserIds: shareIds,
      }),
    ).toBe(true);
    if (carol) {
      expect(
        canAccessDocument({
          userId: carol.id,
          ownerId: alice.id,
          shareUserIds: shareIds,
        }),
      ).toBe(false);
    }
  });
});
