import site from "@/content/settings/site.json";

// Estilos de presentación de la portada. Para sumar uno: agregarlo aquí, escribir su piel en
// app/skins.css (o su propia vista, como el Templo) y sus textos en content/settings/site.json
// (`style.options`).
export const STYLE_IDS = ["templo", "ejecutivo", "noche"] as const;
export type StyleId = (typeof STYLE_IDS)[number];
export const STYLE_KEY = "criden-estilo";

export function isStyle(s: unknown): s is StyleId {
  return typeof s === "string" && (STYLE_IDS as readonly string[]).includes(s);
}

export const DEFAULT_STYLE: StyleId = isStyle(site.defaultStyle) ? site.defaultStyle : "ejecutivo";
