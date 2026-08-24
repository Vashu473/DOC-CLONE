import Link from "next/link";
import { DocsToolbar } from "@/components/DocsToolbar";
import { DocumentList } from "@/components/DocumentList";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DocsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser();
  const { tab } = await searchParams;
  const active = tab === "shared" ? "shared" : "owned";

  const [owned, shared] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: user.id },
      include: { owner: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.document.findMany({
      where: { shares: { some: { userId: user.id } } },
      include: { owner: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const toRow = (
    doc: (typeof owned)[number],
  ) => ({
    id: doc.id,
    title: doc.title,
    updatedAt: doc.updatedAt.toISOString(),
    ownerName: doc.owner.name,
    ownerEmail: doc.owner.email,
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
        Documents
      </h1>
      <p className="mt-1 text-sm text-stone-600">
        Owned docs are yours. Shared with me is access granted by another user.
      </p>
      <div className="mt-6">
        <DocsToolbar />
      </div>
      <div className="mt-8 flex gap-2 border-b border-stone-200">
        <Link
          href="/docs"
          className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
            active === "owned"
              ? "border-emerald-900 text-emerald-950"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          Owned ({owned.length})
        </Link>
        <Link
          href="/docs?tab=shared"
          className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
            active === "shared"
              ? "border-emerald-900 text-emerald-950"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          Shared with me ({shared.length})
        </Link>
      </div>
      <div className="mt-4">
        {active === "owned" ? (
          <DocumentList
            docs={owned.map(toRow)}
            emptyLabel="Create your first document, or import a .txt / .md file."
            canDelete
          />
        ) : (
          <DocumentList
            docs={shared.map(toRow)}
            emptyLabel="Nothing shared with you yet. Log in as Alice, share a doc with bob@ajaia.dev, then open this tab as Bob."
            canDelete={false}
          />
        )}
      </div>
    </main>
  );
}
