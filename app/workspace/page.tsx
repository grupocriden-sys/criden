import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { addDays, dayKey, dayStartISO, fmtDay, fmtShort, todayKey } from "@/lib/workspace/dates";
import { cap } from "@/lib/workspace/format";
import { privateText } from "@/lib/private-content";
import type { CalEvent, Idea, Project, Tag, Task } from "@/lib/workspace/types";
import { EventRow } from "@/components/workspace/event-row";
import { IdeaCapture } from "@/components/workspace/idea-capture";
import { TagChips } from "@/components/workspace/tags";

const t = privateText.workspace;

type TaskRow = Task & { projects: { name: string } | null };

export default async function WorkspaceHome() {
  const supabase = await createClient();
  const today = todayKey();
  const from = dayStartISO(today);
  const to = dayStartISO(addDays(today, 8));

  const [tagsRes, eventsRes, tasksRes, projectsRes, ideasRes] = await Promise.all([
    supabase.from("tags").select("id,name,color").order("name"),
    supabase.from("events").select("*").gte("ends_at", from).lt("starts_at", to).order("starts_at"),
    supabase
      .from("tasks")
      .select("*, projects(name)")
      .neq("status", "hecha")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(8),
    supabase.from("projects").select("*").order("updated_at", { ascending: false }),
    supabase.from("ideas").select("*").order("created_at", { ascending: false }).limit(4),
  ]);

  const tags = (tagsRes.data ?? []) as Tag[];
  const events = (eventsRes.data ?? []) as CalEvent[];
  const tasks = (tasksRes.data ?? []) as TaskRow[];
  const projects = (projectsRes.data ?? []) as Project[];
  const ideas = (ideasRes.data ?? []) as Idea[];
  const projectName = new Map(projects.map((p) => [p.id, p.name]));
  const active = projects
    .filter((p) => ["planificacion", "desarrollo", "revision"].includes(p.status))
    .slice(0, 6);

  const todayEvents = events.filter(
    (e) => dayKey(e.starts_at) <= today && dayKey(e.ends_at) >= today,
  );
  const upcoming = events.filter((e) => !todayEvents.includes(e));

  return (
    <>
      <header className="ws-head">
        <div>
          <p className="ws-eyebrow">{cap(fmtDay(today))}</p>
          <h1>{t.nav.home}</h1>
        </div>
        <Link className="ws-btn" href={`/workspace/calendario?m=${today.slice(0, 7)}&d=${today}`}>
          <CalendarPlus size={18} aria-hidden="true" />
          {t.home.newEvent}
        </Link>
      </header>

      <div className="ws-grid two">
        <div className="ws-stack">
          <section className="ws-card" aria-labelledby="h-hoy">
            <h2 id="h-hoy">{t.home.todayTitle}</h2>
            {todayEvents.length === 0 ? (
              <p className="ws-empty">{t.home.noEventsToday}</p>
            ) : (
              <ul className="ws-list">
                {todayEvents.map((e) => (
                  <EventRow
                    key={e.id}
                    event={e}
                    tags={tags}
                    projectName={e.project_id ? projectName.get(e.project_id) : undefined}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="ws-card" aria-labelledby="h-prox">
            <h2 id="h-prox">{t.home.upcoming}</h2>
            {upcoming.length === 0 ? (
              <p className="ws-empty">{t.home.noUpcoming}</p>
            ) : (
              <ul className="ws-list">
                {upcoming.map((e) => (
                  <EventRow
                    key={e.id}
                    event={e}
                    tags={tags}
                    showDay
                    projectName={e.project_id ? projectName.get(e.project_id) : undefined}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="ws-card" aria-labelledby="h-tareas">
            <h2 id="h-tareas">{t.home.tasks}</h2>
            {tasks.length === 0 ? (
              <p className="ws-empty">{t.home.noTasks}</p>
            ) : (
              <ul className="ws-list">
                {tasks.map((k) => {
                  const late = k.due_date && k.due_date < today;
                  return (
                    <li key={k.id} className="ws-row">
                      <div>
                        <Link href={`/workspace/proyectos/${k.project_id}`}>{k.title}</Link>
                        <p>{k.projects?.name}</p>
                      </div>
                      <div className="ws-row-side">
                        <span className={`ws-badge st-${k.status}`}>{t.taskStatus[k.status]}</span>
                        {k.due_date && (
                          <span className={late ? "ws-late" : "ws-hint"}>
                            {late ? `${t.home.overdue} · ` : ""}
                            {fmtShort(k.due_date)}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="ws-stack">
          <section className="ws-card" aria-labelledby="h-idea">
            <h2 id="h-idea">{t.home.quickIdea}</h2>
            <IdeaCapture back="/workspace" labels={t.ideas.captureLabels} />
          </section>

          <section className="ws-card" aria-labelledby="h-proy">
            <div className="ws-card-head">
              <h2 id="h-proy">{t.home.projects}</h2>
              <Link href="/workspace/proyectos">{t.common.viewAll}</Link>
            </div>
            {active.length === 0 ? (
              <p className="ws-empty">{t.home.noProjects}</p>
            ) : (
              <ul className="ws-list">
                {active.map((p) => (
                  <li key={p.id} className="ws-row">
                    <div>
                      <Link href={`/workspace/proyectos/${p.id}`}>{p.name}</Link>
                      <TagChips ids={p.tag_ids} all={tags} />
                    </div>
                    <span className={`ws-badge ps-${p.status}`}>{t.projectStatus[p.status]}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="ws-card" aria-labelledby="h-ideas">
            <div className="ws-card-head">
              <h2 id="h-ideas">{t.home.ideas}</h2>
              <Link href="/workspace/ideas">{t.common.viewAll}</Link>
            </div>
            {ideas.length === 0 ? (
              <p className="ws-empty">{t.home.noIdeas}</p>
            ) : (
              <ul className="ws-list">
                {ideas.map((i) => (
                  <li key={i.id} className="ws-row">
                    <Link href="/workspace/ideas">{i.title}</Link>
                    <span className={`ws-badge is-${i.status}`}>{t.ideaStatus[i.status]}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
