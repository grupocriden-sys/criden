import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { fmtShort } from "@/lib/workspace/dates";
import { privateText } from "@/lib/private-content";
import {
  PROJECT_STATUSES,
  type Project,
  type ProjectStatus,
  type Tag,
} from "@/lib/workspace/types";
import { ProjectForm } from "@/components/workspace/project-form";
import { TagChips } from "@/components/workspace/tags";

const t = privateText.workspace;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string; error?: string }>;
}) {
  const { s, error } = await searchParams;
  const filter = PROJECT_STATUSES.find((x) => x === s) as ProjectStatus | undefined;

  const supabase = await createClient();
  const [projectsRes, tagsRes, tasksRes] = await Promise.all([
    supabase.from("projects").select("*").order("updated_at", { ascending: false }),
    supabase.from("tags").select("id,name,color").order("name"),
    supabase.from("tasks").select("project_id,status"),
  ]);
  const all = (projectsRes.data ?? []) as Project[];
  const tags = (tagsRes.data ?? []) as Tag[];
  const tasks = (tasksRes.data ?? []) as { project_id: string | null; status: string }[];

  const progress = new Map<string, { done: number; total: number }>();
  for (const k of tasks) {
    if (!k.project_id) continue;
    const p = progress.get(k.project_id) ?? { done: 0, total: 0 };
    p.total += 1;
    if (k.status === "hecha") p.done += 1;
    progress.set(k.project_id, p);
  }

  const counts = new Map<string, number>();
  for (const p of all) counts.set(p.status, (counts.get(p.status) ?? 0) + 1);
  // Por defecto no se muestran los archivados.
  const list = filter
    ? all.filter((p) => p.status === filter)
    : all.filter((p) => p.status !== "archivado");

  return (
    <>
      <header className="ws-head">
        <h1>{t.projects.title}</h1>
      </header>

      <details className="ws-card ws-new" open={error === "1"}>
        <summary>
          <Plus size={18} aria-hidden="true" />
          {t.projects.new}
        </summary>
        {error === "1" && (
          <p className="ws-error" role="alert">
            {t.common.error}
          </p>
        )}
        <ProjectForm tags={tags} />
      </details>

      <nav className="ws-filters" aria-label={t.projects.status}>
        <Link href="/workspace/proyectos" aria-current={!filter ? "true" : undefined}>
          {t.ideas.filterAll}
        </Link>
        {PROJECT_STATUSES.filter((x) => counts.get(x)).map((x) => (
          <Link
            key={x}
            href={`/workspace/proyectos?s=${x}`}
            aria-current={filter === x ? "true" : undefined}
          >
            {t.projectStatus[x]} <span>{counts.get(x)}</span>
          </Link>
        ))}
      </nav>

      {list.length === 0 ? (
        <p className="ws-empty big">{t.projects.empty}</p>
      ) : (
        <ul className="ws-cards">
          {list.map((p) => {
            const pr = progress.get(p.id);
            return (
              <li key={p.id}>
                <Link className="ws-project" href={`/workspace/proyectos/${p.id}`}>
                  <div className="ws-project-top">
                    <h2>{p.name}</h2>
                    <span className={`ws-badge ps-${p.status}`}>{t.projectStatus[p.status]}</span>
                  </div>
                  {p.client && <p className="ws-hint">{p.client}</p>}
                  {p.description && <p className="ws-clamp">{p.description}</p>}
                  {pr && pr.total > 0 && (
                    <div className="ws-progress">
                      <div
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={pr.total}
                        aria-valuenow={pr.done}
                        aria-label={t.projects.checklist}
                      >
                        <i style={{ width: `${Math.round((pr.done / pr.total) * 100)}%` }} />
                      </div>
                      <span>
                        {pr.done}/{pr.total} {t.projects.progress}
                      </span>
                    </div>
                  )}
                  <div className="ws-project-foot">
                    <TagChips ids={p.tag_ids} all={tags} />
                    {p.due_date && (
                      <span className="ws-hint">
                        {t.projects.due}: {fmtShort(p.due_date)}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
