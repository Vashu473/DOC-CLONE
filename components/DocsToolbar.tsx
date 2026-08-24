"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createDocument, importDocument } from "@/app/actions/docs";

export function DocsToolbar() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onNew() {
    setError(null);
    start(async () => {
      const id = await createDocument();
      router.push(`/docs/${id}`);
    });
  }

  function onImport(file: File | undefined) {
    if (!file) return;
    setError(null);
    const data = new FormData();
    data.set("file", file);
    start(async () => {
      const result = await importDocument(data);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("id" in result && result.id) {
        router.push(`/docs/${result.id}`);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onNew}
          disabled={pending}
          className="rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "Working…" : "New document"}
        </button>
        <label className="cursor-pointer rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-stone-50">
          Import .txt / .md
          <input
            type="file"
            accept=".txt,.md,.markdown,text/plain,text/markdown"
            className="hidden"
            onChange={(e) => {
              onImport(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <p className="text-xs leading-5 text-stone-500">
        Supported import: <strong className="font-medium text-stone-700">.txt</strong>{" "}
        and <strong className="font-medium text-stone-700">.md</strong> (max 1 MB).
        Word <strong className="font-medium text-stone-700">.docx</strong> is not
        supported in this slice.
      </p>
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}
