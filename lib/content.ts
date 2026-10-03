import site from "@/content/settings/site.json";
export { default as members } from "@/content/members/members.json";
export { default as projects } from "@/content/projects/projects.json";
export type Lang = "es" | "en";
export function isLang(s: string): s is Lang { return s === "es" || s === "en"; }
export function content(lang: Lang) { return {...site.es, ...Object.fromEntries(Object.entries(site[lang]).filter(([,v]) => v !== ""))} as typeof site.es; }
import _p from "@/content/projects/projects.json";
export const cridenProjects = _p.filter(p => p.type === "criden" && !p.idea);
export const ideaProjects = _p.filter(p => p.idea);
