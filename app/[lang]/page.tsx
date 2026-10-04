import Link from "next/link";
import { notFound } from "next/navigation";
import { content, isLang, members, cridenProjects, ideaProjects } from "@/lib/content";
import { Header, Footer, ProjectVisual } from "@/components/public";
import { HeroStage, type StageItem } from "@/components/public/hero-stage";
import { Spotlight } from "@/components/public/spotlight";
export function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = content(lang);
  return {
    title: "Criden · " + t.hero,
    description: t.intro,
    alternates: { languages: { es: "/es", en: "/en" } },
  };
}
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = content(lang);
  const stageItems: StageItem[] = [
    ...[...cridenProjects, ...ideaProjects].map((p, i) => ({
      key: p.slug,
      name: p.name,
      summary: p[lang].summary || p.es.summary,
      technologies: p.technologies,
      visual: p.visual,
      screenshot: p.screenshot,
      accent: p.accent,
      badge: p.idea ? t.ideaStatus : i === 0 ? t.featured : "",
      href: p.idea ? "#proyectos" : `/${lang}/proyectos/${p.slug}`,
      cta: p.idea ? t.projectsLabel : t.case,
    })),
    {
      key: "tu-idea",
      name: t.yourIdea,
      summary: t.yourIdeaText,
      technologies: [],
      visual: "idea",
      screenshot: "",
      accent: "",
      badge: "",
      href: "#contacto",
      cta: t.contact,
    },
  ];
  return (
    <div lang={lang}>
      <Header lang={lang} />
      <main>
        <Spotlight>
          <section id="inicio" className="hero shell">
            <div>
              <p className="eyebrow">{t.eyebrow}</p>
              <h1>{t.hero}</h1>
              <p className="lead">{t.intro}</p>
              <div className="hero-actions">
                <Link className="button" href="#proyectos">
                  {t.view} <span>↗</span>
                </Link>
                <Link className="button ghost" href="#contacto">
                  {t.contact}
                </Link>
              </div>
            </div>
            <HeroStage
              items={stageItems}
              hint={t.pickerHint}
              label={t.pickerLabel}
              sticker={t.footer}
            />
          </section>
        </Spotlight>
        <div className="band-wrap">
          <div className="band">
            <p className="sr-only">{t.processLabel}</p>
            <ul>
              {t.process.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
        <section id="nosotros" className="section white">
          <div className="shell">
            <p className="eyebrow">{t.aboutLabel}</p>
            <h2>{t.about}</h2>
            <div className="values">
              {t.values.map((v) => (
                <article key={v.title}>
                  <h3>{v.title}</h3>
                  <p>{v.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="equipo" className="section shell">
          <p className="eyebrow">{t.teamLabel}</p>
          <h2>{t.teamTitle}</h2>
          <div className="team">
            {members.map((m) => (
              <Link className="member" key={m.slug} href={`/${lang}/equipo/${m.slug}`}>
                <div className="portrait" aria-hidden="true">
                  {m.photo ? <img src={m.photo} alt="" /> : m.initial}
                  <span>↗</span>
                </div>
                <div className="member-bottom">
                  <div>
                    <h3>{[m.name, m.surname].filter(Boolean).join(" ")}</h3>
                    <p>{m.role[lang] || m.role.es || t.role}</p>
                  </div>
                  <span>{t.profile} →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section id="proyectos" className="section white">
          <div className="shell">
            <p className="eyebrow">{t.projectsLabel}</p>
            <h2>{t.projectsTitle}</h2>
            {cridenProjects.map((p) => (
              <article className="project-card" key={p.slug}>
                <ProjectVisual
                  name={p.name}
                  visual={p.visual}
                  screenshot={p.screenshot}
                  accent={p.accent}
                />
                <div>
                  <span className="eyebrow">CRIDEN / 01</span>
                  <h3>{p.name}</h3>
                  <p>{p[lang].summary}</p>
                  <div className="chips">
                    {p.technologies.map((v) => (
                      <span key={v}>{v}</span>
                    ))}
                  </div>
                  <Link className="text-link" href={`/${lang}/proyectos/${p.slug}`}>
                    {t.case} →
                  </Link>
                </div>
              </article>
            ))}
            <div className="ideas">
              {ideaProjects.map((p) => (
                <article className="idea-card" key={p.slug}>
                  <span className="tag">{t.ideaStatus}</span>
                  <h3>{p.name}</h3>
                  <p>{p[lang].summary}</p>
                  {p.tags.length > 0 && (
                    <div className="chips">
                      {p.tags.map((v) => (
                        <span key={v}>{v}</span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="contacto" className="section shell">
          <div className="contact">
            <p className="eyebrow">{t.contact}</p>
            <h2>{t.contactTitle}</h2>
            <p>{t.contactText}</p>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
