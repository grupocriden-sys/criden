import Link from "next/link";
import { privateText } from "@/lib/private-content";

// Barra común de /admin y /workspace.
export function PrivateBar({ email }: { email?: string }) {
  const t = privateText.nav;
  return (
    <header className="private-bar">
      <nav aria-label={t.workspace}>
        <Link href="/workspace">{t.workspace}</Link>
        <Link href="/admin">{t.admin}</Link>
        <Link href="/es">{t.site}</Link>
      </nav>
      <div className="private-account">
        {email && <span>{email}</span>}
        <form action="/auth/salir" method="post">
          <button className="button ghost small" type="submit">
            {t.signOut}
          </button>
        </form>
      </div>
    </header>
  );
}
