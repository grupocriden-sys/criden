import type { Tag, TagColor } from "./types";

// Cada color de etiqueta equivale a un color de evento de Google Calendar (colorId).
// Así, al sincronizar, un evento con la etiqueta "Cliente" (coral) sale en Tangerine.
export const TAG_COLORS: { key: TagColor; google: string }[] = [
  { key: "blue", google: "7" },
  { key: "navy", google: "9" },
  { key: "teal", google: "2" },
  { key: "green", google: "10" },
  { key: "amber", google: "5" },
  { key: "coral", google: "6" },
  { key: "pink", google: "4" },
  { key: "purple", google: "3" },
];

export function googleColorId(color: TagColor | undefined) {
  return TAG_COLORS.find((c) => c.key === color)?.google;
}

// Etiquetas de un elemento, en el orden de la lista global; ignora ids que ya no existen.
export function tagsOf(ids: string[], all: Tag[]) {
  const set = new Set(ids);
  return all.filter((t) => set.has(t.id));
}
