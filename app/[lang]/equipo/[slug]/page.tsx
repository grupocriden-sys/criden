import { notFound } from "next/navigation";
import Link from "next/link";
import { members, projects, content, isLang } from "@/lib/content";
import { Header, Footer } from "@/components/public";
import { Avatar } from "@/components/public/avatar";
export function generateStaticParams() {
  return ["es", "en"].flatMap((lang) => members.map((m) => ({ lang, slug: m.slug })));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: `${[members.find((m) => m.slug === slug)?.name, members.find((m) => m.slug === slug)?.surname].filter(Boolean).join(" ") || "Equipo"} · Criden`,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const m = members.find((v) => v.slug === slug);
  if (!m) notFound();
  const t = content(lang);
  const pick = (v: { es: string; en: string }) => v[lang] || v.es;
  const fullName = [m.name, m.surname].filter(Boolean).join(" ");
  const role = pick(m.role);
  const bio = pick(m.bio) || t.bio;
  const { linkedin, github, email, cv, whatsapp } = m.links;
  return (
    <div lang={lang}>
      <Header lang={lang} path={`/equipo/${slug}`} />
      <main className="shell section profile">
        <Link className="text-link" href={`/${lang}#equipo`}>
          ← {t.back}
        </Link>
        <div className="profile-grid">
          <div className="portrait">
            {m.photo ? (
              <img src={m.photo} alt={fullName} />
            ) : (
              <Avatar traits={m.avatar} label={fullName} />
            )}
          </div>
          <div>
            <p className="eyebrow">{t.role}</p>
            <h1>{fullName}</h1>
            {role && <p className="profile-role">{role}</p>}
            <p className="lead">{bio}</p>
            <div className="profile-actions">
              {email && (
                <a className="button" href={`mailto:${email}`}>
                  {t.contactMe} <span>↗</span>
                </a>
              )}
              {whatsapp && (
                <a
                  className="button ghost"
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.whatsapp}
                </a>
              )}
              {cv && (
                <a className="button ghost" href={cv} download>
                  {t.downloadCv}
                </a>
              )}
              {linkedin && (
                <a
                  className="button ghost"
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.linkedin}
                </a>
              )}
              {github && (
                <a className="button ghost" href={github} target="_blank" rel="noopener noreferrer">
                  {t.github}
                </a>
              )}
            </div>
          </div>
        </div>
        {m.focus.items.length > 0 && (
          <section className="profile-block focus">
            <h2>{pick(m.focus.title)}</h2>
            <p className="lead">{pick(m.focus.intro)}</p>
            <ul className="focus-list">
              {m.focus.items.map((i) => (
                <li key={i.title.es}>
                  <h3>{pick(i.title)}</h3>
                  <p>{pick(i.description)}</p>
                </li>
              ))}
            </ul>
            {pick(m.focus.closing) && <p className="focus-closing">{pick(m.focus.closing)}</p>}
          </section>
        )}
        {(m.experience.length > 0 || m.skills.length > 0) && (
          <div className="profile-cols">
            {m.experience.length > 0 && (
              <section>
                <h2>{t.experience}</h2>
                <ol className="timeline">
                  {m.experience.map((e) => (
                    <li key={e.org + e.period}>
                      <span className="period">{e.period}</span>
                      <div>
                        <h3>{pick(e.title)}</h3>
                        <p className="org">{e.org}</p>
                        <p>{pick(e.description)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {m.skills.length > 0 && (
              <section>
                <h2>{t.skillsLabel}</h2>
                <div className="chips">
                  {m.skills.map((v) => (
                    <span key={v}>{v}</span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
        {m.education.length > 0 && (
          <section className="profile-block">
            <h2>{t.education}</h2>
            <ol className="timeline">
              {m.education.map((e) => (
                <li key={e.org + e.period}>
                  <span className="period">{e.period}</span>
                  <div>
                    <h3>{pick(e.title)}</h3>
                    <p className="org">{e.org}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
        {projects.some((p) => !p.idea && p.members.includes(slug)) && (
          <section className="profile-block">
            <h2>{t.projectsLabel}</h2>
            <div className="profile-projects">
              {projects
                .filter((p) => !p.idea && p.members.includes(slug))
                .map((p) => {
                  const external = p.type === "independiente";
                  const href = external ? p.url || p.repo : `/${lang}/proyectos/${p.slug}`;
                  const inner = (
                    <>
                      <span className={`tag ${p.type}`}>
                        {p.type === "criden" ? "Criden" : t.independent}
                      </span>
                      <h3>{p.name}</h3>
                      <p>{p[lang].summary || p.es.summary}</p>
                      <div className="chips">
                        {p.technologies.map((v) => (
                          <span key={v}>{v}</span>
                        ))}
                      </div>
                    </>
                  );
                  return external ? (
                    <a
                      key={p.slug}
                      className="profile-project"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {inner}
                    </a>
                  ) : (
                    <Link key={p.slug} className="profile-project" href={href}>
                      {inner}
                    </Link>
                  );
                })}
            </div>
          </section>
        )}
      </main>
      <Footer lang={lang} />
    </div>
  );
}
