"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireUser, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  assertImportFile,
  emptyDoc,
  fileToTiptapDoc,
} from "@/lib/import-file";
import { canAccessDocument, canManageSharing } from "@/lib/permissions";
import {
  DEFAULT_TITLE,
  emptyUploadMessage,
  isValidTiptapDoc,
  normalizeDocumentTitle,
  resolveShareTargetError,
} from "@/lib/document-rules";

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
      title: DEFAULT_TITLE,
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
  const next = normalizeDocumentTitle(title);
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
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Your session expired. Please sign in again." };
    }
    const doc = await loadAccessibleDoc(user.id, documentId);
    if (!doc) return { error: "Document not found or you do not have access." };
    if (!isValidTiptapDoc(content)) {
      return { error: "Invalid document content." };
    }
    // Strip non-JSON values so Prisma never rejects TipTap attrs
    const json = JSON.parse(JSON.stringify(content)) as Prisma.InputJsonValue;
    await prisma.document.update({
      where: { id: documentId },
      data: { content: json },
    });
    // Skip revalidatePath here — autosave fires often and was causing 500s on Vercel
    return { ok: true as const, updatedAt: new Date().toISOString() };
  } catch (err) {
    console.error("saveDocumentContent failed", err);
    return { error: "Could not save. Please try again in a moment." };
  }
}

export async function shareDocument(documentId: string, email: string) {
  const user = await requireUser();
  const doc = await loadAccessibleDoc(user.id, documentId);
  if (!doc) return { error: "Document not found or you do not have access." };
  if (!canManageSharing(user.id, doc.ownerId)) {
    return { error: "Only the owner can share this document." };
  }
  const normalized = email.trim().toLowerCase();
  const target = normalized
    ? await prisma.user.findUnique({ where: { email: normalized } })
    : null;
  const shareError = resolveShareTargetError({
    email,
    ownerId: doc.ownerId,
    target,
  });
  if (shareError) return { error: shareError };
  if (!target) return { error: "User not found." };
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
  if (!(file instanceof File)) {
    return { error: "Choose a .txt or .md file to import." };
  }
  const emptyMsg = emptyUploadMessage(file.size);
  if (emptyMsg) return { error: emptyMsg };
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
