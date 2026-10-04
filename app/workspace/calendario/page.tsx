import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  addDays,
  dayKey,
  dayStartISO,
  fmtDay,
  fmtTime,
  isDayKey,
  isMonthKey,
  monthGrid,
  monthLabel,
  shiftMonth,
  todayKey,
  weekdayLabels,
} from "@/lib/workspace/dates";
import { cap } from "@/lib/workspace/format";
import { privateText } from "@/lib/private-content";
import type { CalEvent, Tag } from "@/lib/workspace/types";
import { EventForm } from "@/components/workspace/event-form";
import { EventRow } from "@/components/workspace/event-row";

const t = privateText.workspace;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_CHIPS = 3;

type Search = {
  m?: string;
  d?: string;
  e?: string;
  title?: string;
  project?: string;
  task?: string;
  error?: string;
};

export default async function CalendarPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const today = todayKey();
  const month = isMonthKey(sp.m) ? sp.m : isDayKey(sp.d) ? sp.d.slice(0, 7) : today.slice(0, 7);
  const selected = isDayKey(sp.d) ? sp.d : today.startsWith(month) ? today : `${month}-01`;
  const grid = monthGrid(month);

  const supabase = await createClient();
  const [tagsRes, projectsRes, eventsRes] = await Promise.all([
    supabase.from("tags").select("id,name,color").order("name"),
    supabase.from("projects").select("id,name").neq("status", "archivado").order("name"),
    supabase
      .from("events")
      .select("*")
      .gte("ends_at", dayStartISO(grid[0]))
      .lt("starts_at", dayStartISO(addDays(grid[grid.length - 1], 1)))
      .order("starts_at"),
  ]);
  const tags = (tagsRes.data ?? []) as Tag[];
  const projects = (projectsRes.data ?? []) as { id: string; name: string }[];
  const events = (eventsRes.data ?? []) as CalEvent[];
  const projectName = new Map(projects.map((p) => [p.id, p.name]));

  // Eventos por día (un evento de varios días aparece en cada uno).
  const byDay = new Map<string, CalEvent[]>();
  for (const e of events) {
    for (let k = dayKey(e.starts_at); k <= dayKey(e.ends_at); k = addDays(k, 1)) {
      byDay.set(k, [...(byDay.get(k) ?? []), e]);
    }
  }
  const dayEvents = byDay.get(selected) ?? [];
  const editing = sp.e && UUID.test(sp.e) ? events.find((e) => e.id === sp.e) : undefined;

  const here = `/workspace/calendario?m=${month}&d=${selected}`;
  const prefill = {
    title: sp.title?.slice(0, 200),
    project_id: sp.project && UUID.test(sp.project) ? sp.project : undefined,
    task_id: sp.task && UUID.test(sp.task) ? sp.task : undefined,
  };

  return (
    <>
      <header className="ws-head">
        <div>
          <p className="ws-eyebrow">{t.calendar.weekdayHint}</p>
          <h1>{t.calendar.title}</h1>
        </div>
      </header>

      <div className="ws-cal">
        <section className="ws-card flush" aria-label={cap(monthLabel(month))}>
          <div className="ws-cal-bar">
            <Link
              className="ws-icon-btn"
              href={`/workspace/calendario?m=${shiftMonth(month, -1)}`}
              aria-label={t.calendar.prev}
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </Link>
            <h2>{cap(monthLabel(month))}</h2>
            <Link
              className="ws-icon-btn"
              href={`/workspace/calendario?m=${shiftMonth(month, 1)}`}
              aria-label={t.calendar.next}
            >
              <ChevronRight size={20} aria-hidden="true" />
            </Link>
            <Link
              className="ws-btn ghost small"
              href={`/workspace/calendario?m=${today.slice(0, 7)}&d=${today}`}
            >
              {t.common.today}
            </Link>
          </div>

          <div className="ws-month">
            {weekdayLabels.map((w) => (
              <div key={w} className="ws-dow">
                {w}
              </div>
            ))}
            {grid.map((key) => {
              const list = byDay.get(key) ?? [];
              const out = !key.startsWith(month);
              return (
                <Link
                  key={key}
                  href={`/workspace/calendario?m=${month}&d=${key}`}
                  className={`ws-day${out ? " out" : ""}${key === today ? " today" : ""}${key === selected ? " selected" : ""}`}
                  aria-label={cap(fmtDay(key))}
                  aria-current={key === selected ? "date" : undefined}
                >
                  <span className="ws-day-num">{Number(key.slice(8))}</span>
                  {list.slice(0, MAX_CHIPS).map((e) => {
                    const first = tags.find((x) => e.tag_ids.includes(x.id));
                    return (
                      <span key={e.id} className={`ws-ev tag-${first?.color ?? "blue"}`}>
                        {!e.all_day && <b>{fmtTime(e.starts_at)}</b>} {e.title}
                      </span>
                    );
                  })}
                  {list.length > MAX_CHIPS && (
                    <span className="ws-more">
                      +{list.length - MAX_CHIPS} {t.calendar.more}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        <aside className="ws-stack" aria-label={cap(fmtDay(selected))}>
          <section className="ws-card">
            <h2>{cap(fmtDay(selected))}</h2>
            {dayEvents.length === 0 ? (
              <p className="ws-empty">{t.calendar.noEvents}</p>
            ) : (
              <ul className="ws-list">
                {dayEvents.map((e) => (
                  <EventRow
                    key={e.id}
                    event={e}
                    tags={tags}
                    projectName={e.project_id ? projectName.get(e.project_id) : undefined}
                    editHref={`${here}&e=${e.id}`}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="ws-card">
            <EventForm
              key={editing?.id ?? `new-${selected}`}
              event={editing}
              date={selected}
              back={here}
              projects={projects}
              tags={tags}
              prefill={prefill}
              cancelHref={editing ? here : undefined}
              error={sp.error === "1"}
            />
            <p className="ws-hint ws-google">{t.calendar.googleSoon}</p>
          </section>
        </aside>
      </div>
    </>
  );
}
