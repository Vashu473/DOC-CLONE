"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { renameDocument } from "@/app/actions/docs";

export function TitleEditor({
  documentId,
  initialTitle,
}: {
  documentId: string;
  initialTitle: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);

  return (
    <input
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onBlur={async () => {
        await renameDocument(documentId, title);
        router.refresh();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
      className="w-full border-none bg-transparent text-3xl font-semibold tracking-tight text-stone-900 outline-none placeholder:text-stone-300"
      placeholder="Untitled document"
      aria-label="Document title"
    />
  );
}
