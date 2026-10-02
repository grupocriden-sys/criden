import {content} from '@/lib/content';
import Link from 'next/link';
export const metadata={robots:{index:false,follow:false}};
export default function Page(){const t=content('es');return <main lang="es" className="shell section"><h1>{t.admin}</h1><p>{t.adminText}</p><Link className="button" href="/es">{t.back}</Link></main>;}
