import { logoutAction } from "@/app/actions/auth";

const LOGO =
  "https://framerusercontent.com/images/GpUVV3ihuH9kJVqQzzhGgv3lt3Q.png?scale-down-to=512&width=1068&height=257";

export function AppHeader({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/85 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Ajaia LLC" className="h-7 w-auto" />
          <span className="hidden rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600 sm:inline">
            Docs
          </span>
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden text-right text-sm text-stone-600 sm:block">
            <span className="font-medium text-stone-900">{name}</span>
            <span className="block text-xs text-stone-500">{email}</span>
          </p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
