import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarPlus, ExternalLink, GitBranch } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createTask, deleteProject, deleteTask, setTask } from "@/app/workspace/actions";
import { dayKey, fmtShort, todayKey } from "@/lib/workspace/dates";
import { privateText } from "@/lib/private-content";
import {
  TASK_STATUSES,
  type CalEvent,
  type Project,
  type Tag,
  type Task,
} from "@/lib/workspace/types";
import { EventRow } from "@/components/workspace/event-row";
import { ProjectForm } from "@/components/workspace/project-form";
import { TagChips } from "@/components/workspace/tags";

const t = privateText.workspace;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (!project) notFound();
  const p = project as Project;

  const today = todayKey();
  const [tagsRes, tasksRes, eventsRes] = await Promise.all([
    supabase.from("tags").select("id,name,color").order("name"),
    supabase.from("tasks").select("*").eq("project_id", id).order("created_at"),
    supabase
      .from("events")
      .select("*")
      .eq("project_id", id)
      .gte("ends_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString())
      .order("starts_at")
      .limit(8),
  ]);
  const tags = (tagsRes.data ?? []) as Tag[];
  const tasks = (tasksRes.data ?? []) as Task[];
  const events = (eventsRes.data ?? []) as CalEvent[];
  const done = tasks.filter((k) => k.status === "hecha").length;
  const here = `/workspace/proyectos/${id}`;

  return (
    <>
      <header className="ws-head">
        <div>
          <Link className="ws-back" href="/workspace/proyectos">
            ← {t.projects.title}
          </Link>
          <h1>{p.name}</h1>
          <div className="ws-meta">
            <span className={`ws-badge ps-${p.status}`}>{t.projectStatus[p.status]}</span>
            {p.client && <span className="ws-hint">{p.client}</span>}
            {p.repo_url && (
              <a href={p.repo_url} target="_blank" rel="noopener noreferrer">
                <GitBranch size={16} aria-hidden="true" /> GitHub
              </a>
            )}
            {p.prod_url && (
              <a href={p.prod_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} aria-hidden="true" /> {t.common.open}
              </a>
            )}
          </div>
          <TagChips ids={p.tag_ids} all={tags} />
        </div>
      </header>

      {error === "1" && (
        <p className="ws-error" role="alert">
          {t.common.error}
        </p>
      )}

      <div className="ws-grid two">
        <section className="ws-card" aria-labelledby="h-check">
          <div className="ws-card-head">
            <h2 id="h-check">{t.projects.checklist}</h2>
            <span className="ws-hint">
              {done}/{tasks.length} {t.projects.progress}
            </span>
          </div>

          <form action={createTask} className="ws-addtask">
            <input type="hidden" name="project_id" value={id} />
            <input
              name="title"
              required
              maxLength={200}
              placeholder={t.projects.taskTitle}
              aria-label={t.projects.taskTitle}
            />
            <input type="date" name="due_date" aria-label={t.common.dueDate} />
            <button type="submit" className="ws-btn">
              {t.common.add}
            </button>
          </form>

          {tasks.length === 0 ? (
            <p className="ws-empty">{t.projects.noTasks}</p>
          ) : (
            <ul className="ws-tasks">
              {tasks.map((k) => {
                const late = k.due_date && k.due_date < today && k.status !== "hecha";
                const schedule = `/workspace/calendario?m=${(k.due_date ?? today).slice(0, 7)}&d=${k.due_date ?? today}&project=${id}&task=${k.id}&title=${encodeURIComponent(k.title)}`;
                return (
                  <li key={k.id} className={`ws-task st-${k.status}`}>
                    <form action={setTask}>
                      <input type="hidden" name="id" value={k.id} />
                      <input type="hidden" name="project_id" value={id} />
                      <div className="ws-task-top">
                        <span className="ws-task-title">{k.title}</span>
                        {k.due_date && (
                          <span className={late ? "ws-late" : "ws-hint"}>
                            {fmtShort(k.due_date)}
                          </span>
                        )}
                      </div>
                      {k.note && <p className="ws-task-note">{k.note}</p>}
                      <div className="ws-task-actions">
                        <div className="ws-seg" role="group" aria-label={k.title}>
                          {TASK_STATUSES.map((s) => (
                            <button
                              key={s}
                              type="submit"
                              name="status"
                              value={s}
                              aria-pressed={k.status === s}
                              className={`st-${s}`}
                            >
                              {t.taskStatus[s]}
                            </button>
                          ))}
                        </div>
                        <Link className="ws-link-btn" href={schedule}>
                          <CalendarPlus size={16} aria-hidden="true" />
                          {t.projects.schedule}
                        </Link>
                      </div>
                      <details className="ws-note">
                        <summary>{t.projects.taskNote}</summary>
                        <textarea name="note" rows={2} defaultValue={k.note} />
                        <div className="ws-actions">
                          <button
                            type="submit"
                            name="status"
                            value={k.status}
                            className="ws-btn small"
                          >
                            {t.projects.saveNote}
                          </button>
                          <button
                            type="submit"
                            formAction={deleteTask}
                            className="ws-btn ghost small danger"
                          >
                            {t.common.delete}
                          </button>
                        </div>
                      </details>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="ws-stack">
          <section className="ws-card" aria-labelledby="h-ev">
            <div className="ws-card-head">
              <h2 id="h-ev">{t.projects.events}</h2>
              <Link
                href={`/workspace/calendario?m=${today.slice(0, 7)}&d=${today}&project=${id}`}
                className="ws-link-btn"
              >
                <CalendarPlus size={16} aria-hidden="true" />
                {t.home.newEvent}
              </Link>
            </div>
            {events.length === 0 ? (
              <p className="ws-empty">{t.projects.noEvents}</p>
            ) : (
              <ul className="ws-list">
                {events.map((e) => (
                  <EventRow
                    key={e.id}
                    event={e}
                    tags={tags}
                    showDay
                    editHref={`/workspace/calendario?m=${dayKey(e.starts_at).slice(0, 7)}&d=${dayKey(e.starts_at)}&e=${e.id}`}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="ws-card" aria-labelledby="h-det">
            <h2 id="h-det">{t.projects.details}</h2>
            {(p.start_date || p.due_date) && (
              <p className="ws-hint">
                {p.start_date && `${t.projects.start}: ${fmtShort(p.start_date)}`}
                {p.start_date && p.due_date && " · "}
                {p.due_date && `${t.projects.due}: ${fmtShort(p.due_date)}`}
              </p>
            )}
            {p.description && <p>{p.description}</p>}
            {p.context && <p className="ws-context">{p.context}</p>}
            <details className="ws-edit" open={error === "1"}>
              <summary>{t.common.edit}</summary>
              <ProjectForm project={p} tags={tags} />
            </details>
            <form action={deleteProject}>
              <input type="hidden" name="id" value={id} />
              <details className="ws-danger">
                <summary>{t.projects.dangerTitle}</summary>
                <p>{t.projects.dangerText}</p>
                <button type="submit" className="ws-btn danger">
                  {t.common.confirmDelete}
                </button>
              </details>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
