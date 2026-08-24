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
      <div className="mb-1">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          Documents
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-stone-600">
          Owned docs are yours. Shared with me is access granted by another user.
        </p>
      </div>
      <div className="mt-6">
        <DocsToolbar />
      </div>
      <div className="mt-8 flex gap-1 rounded-xl bg-stone-200/50 p-1">
        <Link
          href="/docs"
          className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition ${
            active === "owned"
              ? "bg-white text-emerald-950 shadow-sm"
              : "text-stone-600 hover:text-stone-900"
          }`}
        >
          Owned ({owned.length})
        </Link>
        <Link
          href="/docs?tab=shared"
          className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition ${
            active === "shared"
              ? "bg-white text-emerald-950 shadow-sm"
              : "text-stone-600 hover:text-stone-900"
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
