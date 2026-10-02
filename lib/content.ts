import site from "@/content/settings/site.json";
export { default as members } from "@/content/members/members.json";
export { default as projects } from "@/content/projects/projects.json";
export type Lang = "es" | "en";
export function isLang(s: string): s is Lang { return s === "es" || s === "en"; }
export function content(lang: Lang) { return {...site.es, ...Object.fromEntries(Object.entries(site[lang]).filter(([,v]) => v !== ""))} as typeof site.es; }
