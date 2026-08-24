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
      <p className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-stone-500">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white">
      {docs.map((doc) => (
        <li
          key={doc.id}
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-stone-50"
        >
          <div className="min-w-0 flex-1">
            {renamingId === doc.id ? (
              <form
                className="flex gap-2"
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
                  className="w-full max-w-md rounded-md border border-stone-300 px-2 py-1 text-sm"
                />
                <button
                  type="submit"
                  className="text-sm font-medium text-emerald-900"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="text-sm text-stone-500"
                  onClick={() => setRenamingId(null)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <Link
                  href={`/docs/${doc.id}`}
                  className="block truncate font-medium text-stone-900 hover:underline"
                >
                  {doc.title}
                </Link>
                <p className="text-xs text-stone-500">
                  Owner {doc.ownerName} ·{" "}
                  {new Date(doc.updatedAt).toLocaleString()}
                </p>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="text-sm text-stone-600 hover:text-stone-900"
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
                className="text-sm text-red-700 hover:text-red-900"
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
