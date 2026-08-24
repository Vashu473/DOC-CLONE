import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 10);

  const alice = await prisma.user.upsert({
    where: { email: "alice@ajaia.dev" },
    update: { name: "Alice Sharma", passwordHash },
    create: {
      email: "alice@ajaia.dev",
      name: "Alice Sharma",
      passwordHash,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@ajaia.dev" },
    update: { name: "Bob Mensah", passwordHash },
    create: {
      email: "bob@ajaia.dev",
      name: "Bob Mensah",
      passwordHash,
    },
  });

  await prisma.user.upsert({
    where: { email: "carol@ajaia.dev" },
    update: { name: "Carol Ng", passwordHash },
    create: {
      email: "carol@ajaia.dev",
      name: "Carol Ng",
      passwordHash,
    },
  });

  const existing = await prisma.document.findFirst({
    where: { ownerId: alice.id, title: "Welcome to Ajaia Docs" },
  });
  if (!existing) {
    const welcome = await prisma.document.create({
      data: {
        title: "Welcome to Ajaia Docs",
        ownerId: alice.id,
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "Welcome" }],
            },
            {
              type: "paragraph",
              content: [
                { type: "text", text: "This seeded doc is owned by Alice and shared with Bob so reviewers can skip setup." },
              ],
            },
            {
              type: "bulletList",
              content: [
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Create, rename, format, save" }],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Import .txt or .md" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    });
    await prisma.documentShare.create({
      data: { documentId: welcome.id, userId: bob.id, role: "editor" },
    });
  }

  console.log("Seeded Alice, Bob, Carol, and a shared welcome document.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
