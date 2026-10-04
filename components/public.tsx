import Link from "next/link";
import { content, type Lang } from "@/lib/content";
import { ProjectScreen } from "@/components/public/project-screen";
export function Header({ lang, path = "" }: { lang: Lang; path?: string }) {
  const t = content(lang);
  return (
    <header className="header">
      <Link className="brand" href={`/${lang}`} aria-label="Criden">
        <span className="mark">
          C<span>›</span>
        </span>
        CRIDEN<span className="brand-dot">.</span>
      </Link>
      <nav aria-label={t.nav[0]}>
        {t.nav.map((n, i) => (
          <Link key={n} href={`/${lang}#${["inicio", "nosotros", "equipo", "proyectos"][i]}`}>
            {n}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <Link
          className="language"
          href={`/${lang === "es" ? "en" : "es"}${path}`}
          aria-label={lang === "es" ? "English" : "Español"}
        >
          {lang === "es" ? "EN" : "ES"} ↗
        </Link>
        <Link className="button small" href={`/${lang}#contacto`}>
          {t.contact} <span>↗</span>
        </Link>
      </div>
    </header>
  );
}
export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer>
      <span className="brand">CRIDEN.</span>
      <span>
        © {new Date().getFullYear()} · {content(lang).footer}
      </span>
    </footer>
  );
}
export function ProjectVisual({
  name,
  visual = "",
  screenshot = "",
  accent = "",
}: {
  name: string;
  visual?: string;
  screenshot?: string;
  accent?: string;
}) {
  return (
    <div
      className="project-art"
      role="img"
      aria-label={name}
      style={accent ? ({ "--accent": accent } as React.CSSProperties) : undefined}
    >
      <div className="win-top">
        <i />
        <i />
        <i />
        <span>{name}</span>
      </div>
      <ProjectScreen visual={visual} screenshot={screenshot} />
    </div>
  );
}
