import { fmtTime } from "./dates";
import type { CalEvent } from "./types";

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function eventTimeLabel(
  e: Pick<CalEvent, "all_day" | "starts_at" | "ends_at">,
  allDayLabel: string,
) {
  if (e.all_day) return allDayLabel;
  const a = fmtTime(e.starts_at);
  const b = fmtTime(e.ends_at);
  return a === b ? a : `${a} – ${b}`;
}
