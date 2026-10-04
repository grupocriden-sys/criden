import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { freeSlots, type Interval } from "@/lib/calendar/availability";
import { loadConnections, loadExternalEvents, type ExternalItem } from "@/lib/calendar";
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
import { cap, eventTimeLabel } from "@/lib/workspace/format";
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

// Un elemento del calendario: evento propio o de un calendario externo.
type Item = {
  key: string;
  title: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  color: string;
  own?: CalEvent;
  ext?: ExternalItem;
};

export default async function CalendarPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const today = todayKey();
  const month = isMonthKey(sp.m) ? sp.m : isDayKey(sp.d) ? sp.d.slice(0, 7) : today.slice(0, 7);
  const selected = isDayKey(sp.d) ? sp.d : today.startsWith(month) ? today : `${month}-01`;
  const grid = monthGrid(month);
  const from = dayStartISO(grid[0]);
  const to = dayStartISO(addDays(grid[grid.length - 1], 1));

  const supabase = await createClient();
  const [tagsRes, projectsRes, eventsRes, connections] = await Promise.all([
    supabase.from("tags").select("id,name,color").order("name"),
    supabase.from("projects").select("id,name").neq("status", "archivado").order("name"),
    supabase.from("events").select("*").gte("ends_at", from).lt("starts_at", to).order("starts_at"),
    loadConnections(supabase),
  ]);
  const external = await loadExternalEvents(connections, from, to);

  const tags = (tagsRes.data ?? []) as Tag[];
  const projects = (projectsRes.data ?? []) as { id: string; name: string }[];
  const events = (eventsRes.data ?? []) as CalEvent[];
  const projectName = new Map(projects.map((p) => [p.id, p.name]));

  const items: Item[] = [
    ...events.map((e) => ({
      key: e.id,
      title: e.title,
      starts_at: e.starts_at,
      ends_at: e.ends_at,
      all_day: e.all_day,
      color: tags.find((x) => e.tag_ids.includes(x.id))?.color ?? "blue",
      own: e,
    })),
    ...external.events.map((x) => ({
      key: `${x.connection_id}:${x.id}`,
      title: x.title,
      starts_at: x.starts_at,
      ends_at: x.ends_at,
      all_day: x.all_day,
      color: "gray",
      ext: x,
    })),
  ].sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  // Elementos por día (uno de varios días aparece en cada uno).
  const byDay = new Map<string, Item[]>();
  for (const it of items) {
    for (let k = dayKey(it.starts_at); k <= dayKey(it.ends_at); k = addDays(k, 1)) {
      byDay.set(k, [...(byDay.get(k) ?? []), it]);
    }
  }
  const dayItems = byDay.get(selected) ?? [];
  const editing = sp.e && UUID.test(sp.e) ? events.find((e) => e.id === sp.e) : undefined;

  // Disponibilidad: solo tiene sentido si están conectadas las dos personas.
  const connectedOwners = [...new Set(connections.map((c) => c.owner))];
  const bothConnected = connectedOwners.length >= 2;
  const busy: Interval[] = dayItems
    .filter((i) => !i.all_day)
    .map((i) => ({ start: Date.parse(i.starts_at), end: Date.parse(i.ends_at) }));
  const slots = bothConnected ? freeSlots(selected, busy) : [];

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

      {external.failed.length > 0 && (
        <p className="ws-error" role="alert">
          {t.calendar.syncFailed} <Link href="/workspace/conexiones">{t.calendar.connectLink}</Link>
        </p>
      )}

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
                  <span className="ws-day-num">
                    <span>{Number(key.slice(8))}</span>
                  </span>
                  {list.slice(0, MAX_CHIPS).map((it) => (
                    <span
                      key={it.key}
                      title={`${it.all_day ? "" : `${fmtTime(it.starts_at)} `}${it.title}`}
                      className={`ws-ev tag-${it.color}${it.ext ? " ext" : ""}`}
                    >
                      {!it.all_day && <b>{fmtTime(it.starts_at)}</b>} {it.title}
                    </span>
                  ))}
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
            {dayItems.length === 0 ? (
              <p className="ws-empty">{t.calendar.noEvents}</p>
            ) : (
              <ul className="ws-list">
                {dayItems.map((it) =>
                  it.own ? (
                    <EventRow
                      key={it.key}
                      event={it.own}
                      tags={tags}
                      projectName={
                        it.own.project_id ? projectName.get(it.own.project_id) : undefined
                      }
                      editHref={`${here}&e=${it.own.id}`}
                    />
                  ) : (
                    <li key={it.key} className="ws-event tag-gray ext">
                      <div className="ws-event-time">
                        <span>{eventTimeLabel(it, t.common.allDay)}</span>
                      </div>
                      <div className="ws-event-body">
                        <strong>{it.title}</strong>
                        <p>
                          {t.owners[it.ext!.owner]} · {t.calendar.externalBadge}
                        </p>
                        {it.ext!.link && (
                          <a
                            className="ws-link-btn"
                            href={it.ext!.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink size={14} aria-hidden="true" />
                            {t.calendar.openExternal}
                          </a>
                        )}
                      </div>
                    </li>
                  ),
                )}
              </ul>
            )}
          </section>

          <section className="ws-card" aria-labelledby="h-libre">
            <h2 id="h-libre">{t.calendar.availability}</h2>
            {!bothConnected ? (
              <p className="ws-hint">
                {t.calendar.availabilityNeed}{" "}
                <Link href="/workspace/conexiones">{t.calendar.connectLink}</Link>
              </p>
            ) : slots.length === 0 ? (
              <p className="ws-empty">{t.calendar.availabilityNone}</p>
            ) : (
              <>
                <ul className="ws-slots">
                  {slots.map((s) => (
                    <li key={s.start}>
                      {s.start} – {s.end}
                    </li>
                  ))}
                </ul>
                <p className="ws-hint">{t.calendar.availabilityHint}</p>
              </>
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
              hasConnections={connections.length > 0}
            />
          </section>
        </aside>
      </div>
    </>
  );
}
