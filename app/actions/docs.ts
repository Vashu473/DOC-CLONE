"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  assertImportFile,
  emptyDoc,
  fileToTiptapDoc,
} from "@/lib/import-file";
import { canAccessDocument, canManageSharing } from "@/lib/permissions";

async function loadAccessibleDoc(userId: string, documentId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      owner: { select: { id: true, email: true, name: true } },
      shares: { include: { user: { select: { id: true, email: true, name: true } } } },
    },
  });
  if (!doc) return null;
  const allowed = canAccessDocument({
    userId,
    ownerId: doc.ownerId,
    shareUserIds: doc.shares.map((s) => s.userId),
  });
  if (!allowed) return null;
  return doc;
}

export async function createDocument() {
  const user = await requireUser();
  const doc = await prisma.document.create({
    data: {
      title: "Untitled document",
      content: emptyDoc as Prisma.InputJsonValue,
      ownerId: user.id,
    },
  });
  revalidatePath("/docs");
  return doc.id;
}

export async function renameDocument(documentId: string, title: string) {
  const user = await requireUser();
  const doc = await loadAccessibleDoc(user.id, documentId);
  if (!doc) return { error: "Document not found or you do not have access." };
  const next = title.trim().slice(0, 200) || "Untitled document";
  await prisma.document.update({
    where: { id: documentId },
    data: { title: next },
  });
  revalidatePath("/docs");
  revalidatePath(`/docs/${documentId}`);
  return { ok: true as const };
}

export async function saveDocumentContent(
  documentId: string,
  content: unknown,
) {
  const user = await requireUser();
  const doc = await loadAccessibleDoc(user.id, documentId);
  if (!doc) return { error: "Document not found or you do not have access." };
  if (
    !content ||
    typeof content !== "object" ||
    (content as { type?: string }).type !== "doc"
  ) {
    return { error: "Invalid document content." };
  }
  await prisma.document.update({
    where: { id: documentId },
    data: { content: content as Prisma.InputJsonValue },
  });
  revalidatePath(`/docs/${documentId}`);
  return { ok: true as const, updatedAt: new Date().toISOString() };
}

export async function shareDocument(documentId: string, email: string) {
  const user = await requireUser();
  const doc = await loadAccessibleDoc(user.id, documentId);
  if (!doc) return { error: "Document not found or you do not have access." };
  if (!canManageSharing(user.id, doc.ownerId)) {
    return { error: "Only the owner can share this document." };
  }
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { error: "Enter an email address." };
  const target = await prisma.user.findUnique({ where: { email: normalized } });
  if (!target) {
    return {
      error:
        "User not found. Use a seeded account such as bob@ajaia.dev or alice@ajaia.dev.",
    };
  }
  if (target.id === doc.ownerId) {
    return { error: "The owner already has full access." };
  }
  await prisma.documentShare.upsert({
    where: {
      documentId_userId: { documentId, userId: target.id },
    },
    update: { role: "editor" },
    create: { documentId, userId: target.id, role: "editor" },
  });
  revalidatePath("/docs");
  revalidatePath(`/docs/${documentId}`);
  return { ok: true as const };
}

export async function unshareDocument(documentId: string, userId: string) {
  const user = await requireUser();
  const doc = await loadAccessibleDoc(user.id, documentId);
  if (!doc) return { error: "Document not found or you do not have access." };
  if (!canManageSharing(user.id, doc.ownerId)) {
    return { error: "Only the owner can change sharing." };
  }
  await prisma.documentShare.deleteMany({
    where: { documentId, userId },
  });
  revalidatePath("/docs");
  revalidatePath(`/docs/${documentId}`);
  return { ok: true as const };
}

export async function importDocument(formData: FormData) {
  const user = await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a .txt or .md file to import." };
  }
  try {
    assertImportFile(file.name, file.size);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Import failed." };
  }
  const text = await file.text();
  const parsed = fileToTiptapDoc(file.name, text);
  const doc = await prisma.document.create({
    data: {
      title: parsed.title,
      content: parsed.content as Prisma.InputJsonValue,
      ownerId: user.id,
    },
  });
  revalidatePath("/docs");
  return { ok: true as const, id: doc.id };
}

export async function deleteDocument(documentId: string) {
  const user = await requireUser();
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc || doc.ownerId !== user.id) {
    return { error: "Only the owner can delete this document." };
  }
  await prisma.document.delete({ where: { id: documentId } });
  revalidatePath("/docs");
  return { ok: true as const };
}
