"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteDocument, renameDocument } from "@/app/actions/docs";

export type DocRow = {
  id: string;
  title: string;
  updatedAt: string;
  ownerName: string;
  ownerEmail: string;
};

export function DocumentList({
  docs,
  emptyLabel,
  canDelete,
}: {
  docs: DocRow[];
  emptyLabel: string;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  if (!docs.length) {
    return (
      <p className="rounded-2xl border border-dashed border-stone-300 bg-white/70 px-4 py-12 text-center text-sm text-stone-500">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      {docs.map((doc) => (
        <li
          key={doc.id}
          className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-4 py-3.5 last:border-b-0 transition hover:bg-stone-50/80"
        >
          <div className="min-w-0 flex-1">
            {renamingId === doc.id ? (
              <form
                className="flex flex-wrap gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await renameDocument(doc.id, title);
                  setRenamingId(null);
                  router.refresh();
                }}
              >
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full max-w-md rounded-lg border border-stone-300 px-2.5 py-1.5 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/15"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-900 px-2.5 py-1.5 text-sm font-medium text-white"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="rounded-lg px-2.5 py-1.5 text-sm text-stone-500 hover:bg-stone-100"
                  onClick={() => setRenamingId(null)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <Link
                  href={`/docs/${doc.id}`}
                  className="block truncate font-medium text-stone-900 hover:text-emerald-900"
                >
                  {doc.title}
                </Link>
                <p className="mt-0.5 text-xs text-stone-500">
                  Owner {doc.ownerName} ·{" "}
                  {new Date(doc.updatedAt).toLocaleString()}
                </p>
              </>
            )}
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              className="rounded-lg px-2.5 py-1.5 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              onClick={() => {
                setRenamingId(doc.id);
                setTitle(doc.title);
              }}
            >
              Rename
            </button>
            {canDelete ? (
              <button
                type="button"
                className="rounded-lg px-2.5 py-1.5 text-sm text-red-700 hover:bg-red-50"
                onClick={async () => {
                  if (!confirm("Delete this document?")) return;
                  await deleteDocument(doc.id);
                  router.refresh();
                }}
              >
                Delete
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
