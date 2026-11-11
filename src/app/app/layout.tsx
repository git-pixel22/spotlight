import Link from "next/link";
import { Logo } from "@/components/logo";
import { firstName, requireUser } from "@/lib/session";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const user = await requireUser();
  return (
    <div className="flex-1">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <Link href="/app"><Logo /></Link>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="hidden sm:inline">{firstName(user) ?? user.email}</span>
            <form action="/api/auth/logout" method="post">
              <button className="hover:text-ink">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8">{children}</main>
    </div>
  );
}
