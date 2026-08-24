import { AppHeader } from "@/components/AppHeader";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader name={user.name} email={user.email} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
