"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { shareDocument, unshareDocument } from "@/app/actions/docs";

type ShareRow = { userId: string; email: string; name: string };

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
  const [email, setEmail] = useState("bob@ajaia.dev");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!isOwner) {
    return (
      <p className="text-xs text-stone-500">
        Shared with you as an editor. Only the owner can change access.
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setMessage(null);
        }}
        className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
      >
        Share
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-stone-900">
              Share document
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Grant editor access to an existing user. Seeded demo:{" "}
              <code className="text-xs">bob@ajaia.dev</code>
            </p>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                start(async () => {
                  const result = await shareDocument(documentId, email);
                  if (result && "error" in result && result.error) {
                    setMessage(result.error);
                    return;
                  }
                  setMessage("Access granted.");
                  router.refresh();
                });
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
                placeholder="user@ajaia.dev"
              />
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-emerald-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Grant
              </button>
            </form>
            {message ? (
              <p className="mt-2 text-sm text-stone-700">{message}</p>
            ) : null}
            <ul className="mt-4 space-y-2">
              {shares.length === 0 ? (
                <li className="text-sm text-stone-500">Not shared yet.</li>
              ) : (
                shares.map((s) => (
                  <li
                    key={s.userId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {s.name}{" "}
                      <span className="text-stone-500">({s.email})</span> ·
                      editor
                    </span>
                    <button
                      type="button"
                      className="text-red-700"
                      onClick={() =>
                        start(async () => {
                          await unshareDocument(documentId, s.userId);
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
            <button
              type="button"
              className="mt-5 text-sm text-stone-500 hover:text-stone-800"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
