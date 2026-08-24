import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/auth";

const LOGO =
  "https://framerusercontent.com/images/GpUVV3ihuH9kJVqQzzhGgv3lt3Q.png?scale-down-to=512&width=1068&height=257";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/docs");
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-md rounded-3xl border border-stone-200/80 bg-white/95 p-8 shadow-[0_20px_50px_-28px_rgba(28,25,23,0.35)] backdrop-blur">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="Ajaia LLC" className="mb-6 h-8 w-auto" />
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          Ajaia Docs
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Lightweight collaborative documents. Seeded accounts are ready so
          reviewers can test sharing without signup.
        </p>
        <div className="mt-6 rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3.5 text-sm text-stone-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Demo accounts
          </p>
          <ul className="mt-2 space-y-1.5 font-mono text-xs leading-5">
            <li>alice@ajaia.dev / demo1234 — owner</li>
            <li>bob@ajaia.dev / demo1234 — shared-with</li>
            <li>carol@ajaia.dev / demo1234 — no access</li>
          </ul>
        </div>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
