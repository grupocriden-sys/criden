// Horarios libres: cuenta los huecos de un día que quedan sin ocupar para todas las personas.
// Todo en milisegundos; las horas se interpretan en Ecuador (UTC-5).
export type Interval = { start: number; end: number };

const hhmm = (ms: number) => {
  const d = new Date(ms - 5 * 3600_000);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};

export function freeSlots(
  day: string,
  busy: Interval[],
  options: { from?: string; to?: string; minMinutes?: number } = {},
) {
  const { from = "08:00", to = "20:00", minMinutes = 30 } = options;
  const dayStart = Date.parse(`${day}T${from}:00-05:00`);
  const dayEnd = Date.parse(`${day}T${to}:00-05:00`);

  // Ocupado dentro de la ventana, ordenado y unido.
  const merged: Interval[] = [];
  for (const b of busy
    .map((i) => ({ start: Math.max(i.start, dayStart), end: Math.min(i.end, dayEnd) }))
    .filter((i) => i.end > i.start)
    .sort((a, b) => a.start - b.start)) {
    const last = merged[merged.length - 1];
    if (last && b.start <= last.end) last.end = Math.max(last.end, b.end);
    else merged.push({ ...b });
  }

  const slots: { start: string; end: string }[] = [];
  let cursor = dayStart;
  for (const b of [...merged, { start: dayEnd, end: dayEnd }]) {
    if (b.start - cursor >= minMinutes * 60_000)
      slots.push({ start: hhmm(cursor), end: hhmm(b.start) });
    cursor = Math.max(cursor, b.end);
  }
  return slots;
}
