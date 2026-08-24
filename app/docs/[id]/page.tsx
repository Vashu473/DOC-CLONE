import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentEditor } from "@/components/DocumentEditor";
import { ShareDialog } from "@/components/ShareDialog";
import { TitleEditor } from "@/components/TitleEditor";
import { requireUser } from "@/lib/auth";
import { canAccessDocument } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, email: true, name: true } },
      shares: {
        include: { user: { select: { id: true, email: true, name: true } } },
      },
    },
  });
  if (!doc) notFound();
  const allowed = canAccessDocument({
    userId: user.id,
    ownerId: doc.ownerId,
    shareUserIds: doc.shares.map((s) => s.userId),
  });
  if (!allowed) notFound();

  const isOwner = user.id === doc.ownerId;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <Link
        href="/docs"
        className="text-sm font-medium text-emerald-900 hover:underline"
      >
        ← All documents
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <TitleEditor documentId={doc.id} initialTitle={doc.title} />
          <p className="mt-1 text-sm text-stone-500">
            Owner {doc.owner.name} ({doc.owner.email})
            {isOwner ? " · you own this" : " · shared with you"}
          </p>
        </div>
        <ShareDialog
          documentId={doc.id}
          isOwner={isOwner}
          shares={doc.shares.map((s) => ({
            userId: s.user.id,
            email: s.user.email,
            name: s.user.name,
          }))}
        />
      </div>
      <div className="mt-6">
        <DocumentEditor
          documentId={doc.id}
          initialTitle={doc.title}
          initialContent={doc.content as object}
        />
      </div>
    </main>
  );
}
