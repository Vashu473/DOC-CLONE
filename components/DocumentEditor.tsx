"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { useEffect, useRef, useState } from "react";
import { saveDocumentContent } from "@/app/actions/docs";
import { FontSize } from "@/lib/tiptap-font-size";

type Status = "saved" | "saving" | "unsaved" | "error";

const SIZE_H1 = "1.75rem";
const SIZE_H2 = "1.35rem";

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
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saving = useRef(false);

  async function persist(content: object) {
    if (saving.current) return;
    saving.current = true;
    setStatus("saving");
    try {
      const result = await saveDocumentContent(documentId, content);
      if (result && "error" in result && result.error) {
        setStatus("error");
        setError(result.error);
        return;
      }
      setError(null);
      setStatus("saved");
      setSavedAt(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch {
      setStatus("error");
      setError("Could not reach the server. Check your connection and retry.");
    } finally {
      saving.current = false;
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextStyle,
      FontSize,
      Underline,
      Placeholder.configure({
        placeholder: "Start writing…",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "doc-editor max-w-none min-h-[55vh] px-1 py-2 focus:outline-none",
      },
    },
    onUpdate: ({ editor: instance }) => {
      setStatus("unsaved");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void persist(instance.getJSON());
      }, 1100);
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
    await persist(editor.getJSON());
  }

  function toggleSize(size: string) {
    if (!editor) return;
    const active =
      editor.isActive("textStyle", { fontSize: size }) ||
      editor.getAttributes("textStyle").fontSize === size;
    if (active) {
      editor.chain().focus().unsetFontSize().run();
    } else {
      editor.chain().focus().setFontSize(size).run();
    }
  }

  const btn = (active: boolean) =>
    `rounded-md px-2.5 py-1.5 text-sm font-medium transition ${
      active
        ? "bg-emerald-900 text-white shadow-sm"
        : "text-stone-700 hover:bg-white hover:shadow-sm"
    }`;

  const statusLabel =
    status === "saved"
      ? savedAt
        ? `All changes saved · ${savedAt}`
        : "All changes saved"
      : status === "saving"
        ? "Saving your changes…"
        : status === "unsaved"
          ? "Unsaved changes"
          : "Couldn’t save — try again";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${
              status === "saved"
                ? "bg-emerald-500"
                : status === "saving"
                  ? "animate-pulse bg-amber-400"
                  : status === "unsaved"
                    ? "bg-stone-400"
                    : "bg-red-500"
            }`}
            aria-hidden
          />
          <p className="truncate text-sm text-stone-600">{statusLabel}</p>
        </div>
        <button
          type="button"
          onClick={saveNow}
          disabled={status === "saving" || status === "saved"}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-default disabled:bg-stone-200 disabled:text-stone-500"
        >
          {status === "saving" ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving…
            </>
          ) : status === "saved" ? (
            "Saved"
          ) : (
            "Save now"
          )}
        </button>
      </div>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {editor ? (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="sticky top-0 z-10 flex flex-wrap gap-1 border-b border-stone-200 bg-stone-50/95 px-2 py-2 backdrop-blur">
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
            <span className="mx-1 hidden w-px self-stretch bg-stone-300 sm:block" />
            <button
              type="button"
              title="Large text on selection only"
              className={btn(
                editor.getAttributes("textStyle").fontSize === SIZE_H1,
              )}
              onClick={() => toggleSize(SIZE_H1)}
            >
              H1
            </button>
            <button
              type="button"
              title="Medium text on selection only"
              className={btn(
                editor.getAttributes("textStyle").fontSize === SIZE_H2,
              )}
              onClick={() => toggleSize(SIZE_H2)}
            >
              H2
            </button>
            <button
              type="button"
              title="Reset text size on selection"
              className={btn(!editor.getAttributes("textStyle").fontSize)}
              onClick={() => editor.chain().focus().unsetFontSize().run()}
            >
              Body
            </button>
            <span className="mx-1 hidden w-px self-stretch bg-stone-300 sm:block" />
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
          <div className="px-5 py-5 sm:px-8 sm:py-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-stone-400">
              {initialTitle}
            </p>
            <EditorContent editor={editor} />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center text-sm text-stone-500">
          Loading editor…
        </div>
      )}
    </div>
  );
}
