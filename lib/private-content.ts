import es from "@/content/private/es.json";

// Textos de la zona privada. Por ahora solo español (ver CLAUDE.md §5).
export const privateText = es;
export type LoginError = keyof typeof es.login.errors;
