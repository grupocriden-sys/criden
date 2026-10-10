import type { content, Lang, members, projects, contactInfo } from "@/lib/content";

// Todo lo que el Templo necesita para dibujarse. Llega desde la página (servidor) ya resuelto al idioma.
export type TemploData = {
  lang: Lang;
  t: ReturnType<typeof content>;
  members: typeof members;
  projects: typeof projects;
  contact: typeof contactInfo;
};

export type HallId = "puerta" | "nosotros" | "proyectos" | "equipo" | "contacto";
