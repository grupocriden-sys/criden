import {notFound} from 'next/navigation';
import Link from 'next/link';
import {members,projects,content,isLang} from '@/lib/content';
import {Header,Footer} from '@/components/public';
export function generateStaticParams(){return ['es','en'].flatMap(lang=>members.map(m=>({lang,slug:m.slug})));}
export async function generateMetadata({params}:{params:Promise<{lang:string;slug:string}>}){const {slug}=await params;return {title: `${members.find(m=>m.slug===slug)?.name ?? 'Equipo'} · Criden`};}
export default async function Page({params}:{params:Promise<{lang:string;slug:string}>}){const {lang,slug}=await params;if(!isLang(lang))notFound();const m=members.find(v=>v.slug===slug);if(!m)notFound();const t=content(lang);return <div lang={lang}><Header lang={lang} path={`/equipo/${slug}`}/><main className="shell section profile"><Link className="text-link" href={`/${lang}#equipo`}>← {t.back}</Link><div className="profile-grid"><div className="portrait">{m.initial}</div><div><p className="eyebrow">{t.role}</p><h1>{m.name}</h1><p className="lead">{t.bio}</p><h3>{t.projectsLabel}</h3>{projects.filter(p=>p.members.includes(slug)).map(p=><Link key={p.slug} className="text-link" href={`/${lang}/proyectos/${p.slug}`}>{p.name} ↗</Link>)}</div></div></main><Footer lang={lang}/></div>;}
