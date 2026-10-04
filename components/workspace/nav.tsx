"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, LogOut, Settings2 } from "lucide-react";
import { MODULES, type ModuleKey } from "@/lib/workspace/modules";

type Labels = Record<ModuleKey, string> & { menu: string };

// Escritorio: barra lateral. Celular: barra superior breve y pestañas abajo.
// Los módulos salen de lib/workspace/modules.ts.
export function WorkspaceNav({ labels, email }: { labels: Labels; email?: string }) {
  const pathname = usePathname();
  const current = (href: string, exact?: boolean) =>
    (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`))
      ? ("page" as const)
      : undefined;

  const links = MODULES.map(({ href, key, icon: Icon, exact }) => (
    <Link key={href} href={href} aria-current={current(href, exact)}>
      <Icon size={20} aria-hidden="true" />
      <span>{labels[key]}</span>
    </Link>
  ));

  return (
    <>
      <aside className="ws-side">
        <Link className="ws-brand" href="/workspace" aria-label="Criden">
          <span className="mark">
            C<span>›</span>
          </span>
          <span className="ws-brand-name">CRIDEN</span>
        </Link>

        <nav aria-label={labels.menu} className="ws-links">
          {links}
        </nav>

        <div className="ws-foot">
          {email && <p className="ws-email">{email}</p>}
          <Link href="/admin">
            <Settings2 size={16} aria-hidden="true" />
            <span>{labels.admin}</span>
          </Link>
          <Link href="/es">
            <Globe size={16} aria-hidden="true" />
            <span>{labels.site}</span>
          </Link>
          <form action="/auth/salir" method="post">
            <button type="submit">
              <LogOut size={16} aria-hidden="true" />
              <span>{labels.signOut}</span>
            </button>
          </form>
        </div>
      </aside>

      <nav aria-label={labels.menu} className="ws-tabs">
        {links}
      </nav>
    </>
  );
}
