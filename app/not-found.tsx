import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-stone-900">Not found</h1>
      <p className="mt-2 text-sm text-stone-600">
        This document does not exist, or you do not have access. Ask the owner
        to share it with your account.
      </p>
      <Link
        href="/docs"
        className="mt-6 text-sm font-medium text-emerald-900 hover:underline"
      >
        Back to documents
      </Link>
    </main>
  );
}
