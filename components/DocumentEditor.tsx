"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";
import { saveDocumentContent } from "@/app/actions/docs";

type Status = "saved" | "saving" | "unsaved" | "error";

export function DocumentEditor({
  documentId,
  initialTitle,
  initialContent,
}: {
  documentId: string;
  initialTitle: string;
  initialContent: object;
}) {
  const [status, setStatus] = useState<Status>("saved");
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Placeholder.configure({
        placeholder: "Start writing…",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-stone max-w-none min-h-[60vh] px-1 py-2 focus:outline-none",
      },
    },
    onUpdate: ({ editor: instance }) => {
      setStatus("unsaved");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        setStatus("saving");
        const result = await saveDocumentContent(
          documentId,
          instance.getJSON(),
        );
        if (result && "error" in result && result.error) {
          setStatus("error");
          setError(result.error);
          return;
        }
        setError(null);
        setStatus("saved");
      }, 900);
    },
  });

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function saveNow() {
    if (!editor) return;
    if (timer.current) clearTimeout(timer.current);
    setStatus("saving");
    const result = await saveDocumentContent(documentId, editor.getJSON());
    if (result && "error" in result && result.error) {
      setStatus("error");
      setError(result.error);
      return;
    }
    setError(null);
    setStatus("saved");
  }

  const btn = (active: boolean) =>
    `rounded px-2 py-1 text-sm ${
      active ? "bg-stone-800 text-white" : "text-stone-700 hover:bg-stone-100"
    }`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
          {status === "saved" && "Saved"}
          {status === "saving" && "Saving…"}
          {status === "unsaved" && "Unsaved"}
          {status === "error" && "Save failed"}
        </p>
        <button
          type="button"
          onClick={saveNow}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-stone-50"
        >
          Save now
        </button>
      </div>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {editor ? (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="flex flex-wrap gap-1 border-b border-stone-200 bg-stone-50 px-2 py-2">
            <button
              type="button"
              className={btn(editor.isActive("bold"))}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              Bold
            </button>
            <button
              type="button"
              className={btn(editor.isActive("italic"))}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              Italic
            </button>
            <button
              type="button"
              className={btn(editor.isActive("underline"))}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              Underline
            </button>
            <span className="mx-1 w-px bg-stone-300" />
            <button
              type="button"
              className={btn(editor.isActive("heading", { level: 1 }))}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
            >
              H1
            </button>
            <button
              type="button"
              className={btn(editor.isActive("heading", { level: 2 }))}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            >
              H2
            </button>
            <button
              type="button"
              className={btn(editor.isActive("paragraph"))}
              onClick={() => editor.chain().focus().setParagraph().run()}
            >
              Body
            </button>
            <span className="mx-1 w-px bg-stone-300" />
            <button
              type="button"
              className={btn(editor.isActive("bulletList"))}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              Bullets
            </button>
            <button
              type="button"
              className={btn(editor.isActive("orderedList"))}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              Numbers
            </button>
          </div>
          <div className="px-6 py-4">
            <p className="mb-3 text-xs text-stone-400">Editing {initialTitle}</p>
            <EditorContent editor={editor} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-stone-500">Loading editor…</p>
      )}
    </div>
  );
}
