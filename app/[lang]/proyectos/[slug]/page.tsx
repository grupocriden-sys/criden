import { notFound } from "next/navigation";
import Link from "next/link";
import { cridenProjects as projects, content, isLang } from "@/lib/content";
import { Header, Footer, ProjectVisual } from "@/components/public";
export function generateStaticParams() {
  return ["es", "en"].flatMap((lang) => projects.map((p) => ({ lang, slug: p.slug })));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  return {
    title: `${p?.name ?? "Proyecto"} · Criden`,
    description: p && isLang(lang) ? p[lang].summary : undefined,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const p = projects.find((v) => v.slug === slug);
  if (!p) notFound();
  const t = content(lang);
  return (
    <div lang={lang}>
      <Header lang={lang} path={`/proyectos/${slug}`} />
      <main className="shell section">
        <Link className="text-link" href={`/${lang}#proyectos`}>
          ← {t.back}
        </Link>
        <p className="eyebrow case-label">CRIDEN</p>
        <h1>{p.name}</h1>
        <p className="lead">{p[lang].summary}</p>
        <ProjectVisual
          name={p.name}
          visual={p.visual}
          screenshot={p.screenshot}
          accent={p.accent}
        />
        <div className="values">
          <article>
            <h3>{t.problem}</h3>
            <p>{p[lang].problem}</p>
          </article>
          <article>
            <h3>{t.solution}</h3>
            <p>{p[lang].solution}</p>
          </article>
          <article>
            <h3>{t.skills}</h3>
            <div className="chips">
              {p.technologies.map((v) => (
                <span key={v}>{v}</span>
              ))}
            </div>
          </article>
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
