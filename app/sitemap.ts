import type {MetadataRoute} from 'next';
import {members,cridenProjects as projects} from '@/lib/content';
export default function sitemap():MetadataRoute.Sitemap{const url=process.env.NEXT_PUBLIC_SITE_URL;if(!url)return [];return ['es','en'].flatMap(l=>['',...members.map(m=>'/equipo/'+m.slug),...projects.map(p=>'/proyectos/'+p.slug)].map(p=>({url:new URL('/'+l+p,url).href})));}
