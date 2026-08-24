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
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="Ajaia LLC" className="mb-6 h-8 w-auto" />
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Ajaia Docs
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Internal-style document editor for the AI-Native Full Stack take-home.
          Seeded accounts are ready so reviewers can test sharing without signup.
        </p>
        <div className="mt-6 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
          <p className="font-medium text-stone-900">Demo accounts</p>
          <ul className="mt-2 space-y-1 font-mono text-xs">
            <li>alice@ajaia.dev / demo1234 - owner</li>
            <li>bob@ajaia.dev / demo1234 - shared-with</li>
            <li>carol@ajaia.dev / demo1234 - no access (authz)</li>
          </ul>
        </div>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
