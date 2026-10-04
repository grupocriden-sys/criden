// Ecuador continental: America/Guayaquil, UTC-5 todo el año (sin horario de verano).
// Todas las fechas se guardan en UTC (timestamptz) y se muestran en esta zona.
export const TZ = "America/Guayaquil";
const OFFSET_MS = -5 * 3600 * 1000;

export const dayKey = (iso: string | Date) => {
  const t = typeof iso === "string" ? Date.parse(iso) : iso.getTime();
  return new Date(t + OFFSET_MS).toISOString().slice(0, 10);
};
export const todayKey = () => dayKey(new Date());
export const dayStartISO = (key: string) => new Date(`${key}T00:00:00-05:00`).toISOString();

export function addDays(key: string, n: number) {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function shiftMonth(ym: string, n: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}

export const isMonthKey = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}$/.test(v);
export const isDayKey = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

// Días que muestra el calendario del mes: semanas completas, empezando en lunes.
export function monthGrid(ym: string) {
  const first = `${ym}-01`;
  const weekday = new Date(`${first}T12:00:00Z`).getUTCDay();
  const offset = (weekday + 6) % 7;
  const daysInMonth = new Date(
    Date.UTC(Number(ym.slice(0, 4)), Number(ym.slice(5)), 0),
  ).getUTCDate();
  const total = daysInMonth + offset <= 35 ? 35 : 42;
  const start = addDays(first, -offset);
  return Array.from({ length: total }, (_, i) => addDays(start, i));
}

const timeFmt = new Intl.DateTimeFormat("es-EC", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TZ,
});
export const fmtTime = (iso: string) => timeFmt.format(new Date(iso));

export const fmtDay = (key: string) =>
  new Intl.DateTimeFormat("es-EC", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${key}T12:00:00Z`));

export const fmtShort = (key: string) =>
  new Intl.DateTimeFormat("es-EC", { day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(`${key}T12:00:00Z`),
  );

export const monthLabel = (ym: string) =>
  new Intl.DateTimeFormat("es-EC", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${ym}-01T12:00:00Z`),
  );

export const weekdayLabels = (() => {
  const f = new Intl.DateTimeFormat("es-EC", { weekday: "short", timeZone: "UTC" });
  // 2026-01-05 es lunes.
  return Array.from({ length: 7 }, (_, i) => f.format(new Date(Date.UTC(2026, 0, 5 + i, 12))));
})();

// "2026-10-14" + "19:00" → instante UTC en ISO.
export const toISO = (date: string, time: string) =>
  new Date(`${date}T${time}:00-05:00`).toISOString();
export const timeOf = (iso: string) => fmtTime(iso);
