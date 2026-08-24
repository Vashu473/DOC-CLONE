"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { shareDocument, unshareDocument } from "@/app/actions/docs";

type ShareRow = { userId: string; email: string; name: string };

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ShareDialog({
  documentId,
  isOwner,
  shares,
}: {
  documentId: string;
  isOwner: boolean;
  shares: ShareRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("bob@ajaia.dev");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!isOwner) {
    return (
      <p className="max-w-56 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs leading-5 text-stone-600">
        Shared with you as an editor. Only the owner can change access.
      </p>
    );
  }

  const modal =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            role="presentation"
          >
            <button
              type="button"
              aria-label="Close share dialog"
              className="absolute inset-0 bg-stone-900/50 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-dialog-title"
              className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_24px_60px_-28px_rgba(28,25,23,0.45)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-stone-100 px-5 py-4">
                <div>
                  <h2
                    id="share-dialog-title"
                    className="text-lg font-semibold tracking-tight text-stone-900"
                  >
                    Share document
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-stone-600">
                    Invite an existing user as an editor. Demo account:{" "}
                    <span className="font-mono text-xs text-stone-800">
                      bob@ajaia.dev
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-1 text-lg leading-none text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="px-5 py-4">
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    start(async () => {
                      const result = await shareDocument(documentId, email);
                      if (result && "error" in result && result.error) {
                        setIsError(true);
                        setMessage(result.error);
                        return;
                      }
                      setIsError(false);
                      setMessage("Editor access granted.");
                      router.refresh();
                    });
                  }}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-800 focus:ring-4 focus:ring-emerald-800/15"
                    placeholder="name@ajaia.dev"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={pending}
                    className="shrink-0 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                  >
                    {pending ? "…" : "Grant"}
                  </button>
                </form>

                {message ? (
                  <p
                    className={`mt-3 rounded-xl px-3 py-2 text-sm ${
                      isError
                        ? "border border-red-200 bg-red-50 text-red-800"
                        : "border border-emerald-200 bg-emerald-50 text-emerald-900"
                    }`}
                  >
                    {message}
                  </p>
                ) : null}

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    People with access
                  </p>
                  <ul className="mt-2 space-y-2">
                    {shares.length === 0 ? (
                      <li className="rounded-xl border border-dashed border-stone-200 px-3 py-4 text-center text-sm text-stone-500">
                        Not shared with anyone yet.
                      </li>
                    ) : (
                      shares.map((s) => (
                        <li
                          key={s.userId}
                          className="flex items-center justify-between gap-3 rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-2.5"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-xs font-semibold text-white">
                              {initials(s.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-stone-900">
                                {s.name}
                              </p>
                              <p className="truncate text-xs text-stone-500">
                                {s.email} · editor
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={pending}
                            className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                            onClick={() =>
                              start(async () => {
                                await unshareDocument(documentId, s.userId);
                                setMessage(null);
                                router.refresh();
                              })
                            }
                          >
                            Remove
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              <div className="border-t border-stone-100 px-5 py-3">
                <button
                  type="button"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                  onClick={() => setOpen(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setMessage(null);
          setIsError(false);
        }}
        className="rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm font-semibold text-stone-800 shadow-sm transition hover:bg-stone-50"
      >
        Share
      </button>
      {modal}
    </div>
  );
}
