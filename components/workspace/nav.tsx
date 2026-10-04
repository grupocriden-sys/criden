"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  FolderKanban,
  Globe,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Settings2,
  Tag,
} from "lucide-react";

type Labels = {
  menu: string;
  home: string;
  calendar: string;
  projects: string;
  ideas: string;
  tags: string;
  admin: string;
  site: string;
  signOut: string;
};

const ITEMS = [
  { href: "/workspace", key: "home", icon: LayoutDashboard, exact: true },
  { href: "/workspace/calendario", key: "calendar", icon: CalendarDays, exact: false },
  { href: "/workspace/proyectos", key: "projects", icon: FolderKanban, exact: false },
  { href: "/workspace/ideas", key: "ideas", icon: Lightbulb, exact: false },
  { href: "/workspace/etiquetas", key: "tags", icon: Tag, exact: false },
] as const;

// Escritorio: barra lateral. Celular: barra superior breve y pestañas abajo.
export function WorkspaceNav({ labels, email }: { labels: Labels; email?: string }) {
  const pathname = usePathname();
  const current = (href: string, exact: boolean) =>
    (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`))
      ? ("page" as const)
      : undefined;

  const links = ITEMS.map(({ href, key, icon: Icon, exact }) => (
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
