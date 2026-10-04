import Link from "next/link";
import { Mic } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { convertIdea, deleteIdea, setIdeaStatus } from "@/app/workspace/actions";
import { dayKey, fmtShort } from "@/lib/workspace/dates";
import { privateText } from "@/lib/private-content";
import { IDEA_STATUSES, type Idea, type IdeaStatus, type Tag } from "@/lib/workspace/types";
import { IdeaCapture } from "@/components/workspace/idea-capture";
import { TagChips } from "@/components/workspace/tags";

const t = privateText.workspace;

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string; error?: string }>;
}) {
  const { s, error } = await searchParams;
  const filter = IDEA_STATUSES.find((x) => x === s) as IdeaStatus | undefined;

  const supabase = await createClient();
  const [ideasRes, tagsRes] = await Promise.all([
    supabase.from("ideas").select("*").order("created_at", { ascending: false }),
    supabase.from("tags").select("id,name,color").order("name"),
  ]);
  const all = (ideasRes.data ?? []) as Idea[];
  const tags = (tagsRes.data ?? []) as Tag[];

  const counts = new Map<string, number>();
  for (const i of all) counts.set(i.status, (counts.get(i.status) ?? 0) + 1);
  const list = filter ? all.filter((i) => i.status === filter) : all;
  const back = filter ? `/workspace/ideas?s=${filter}` : "/workspace/ideas";

  return (
    <>
      <header className="ws-head">
        <h1>{t.ideas.title}</h1>
      </header>

      <section className="ws-card" aria-labelledby="h-cap">
        <h2 id="h-cap">{t.ideas.capture}</h2>
        {error === "1" && (
          <p className="ws-error" role="alert">
            {t.common.error}
          </p>
        )}
        <IdeaCapture back={back} labels={t.ideas.captureLabels} />
      </section>

      <nav className="ws-filters" aria-label={t.ideas.status}>
        <Link href="/workspace/ideas" aria-current={!filter ? "true" : undefined}>
          {t.ideas.filterAll} <span>{all.length}</span>
        </Link>
        {IDEA_STATUSES.filter((x) => counts.get(x)).map((x) => (
          <Link
            key={x}
            href={`/workspace/ideas?s=${x}`}
            aria-current={filter === x ? "true" : undefined}
          >
            {t.ideaStatus[x]} <span>{counts.get(x)}</span>
          </Link>
        ))}
      </nav>

      {list.length === 0 ? (
        <p className="ws-empty big">{t.ideas.empty}</p>
      ) : (
        <ul className="ws-cards">
          {list.map((i) => (
            <li key={i.id} className="ws-card idea">
              <form>
                <input type="hidden" name="id" value={i.id} />
                <input type="hidden" name="back" value={back} />
                <div className="ws-project-top">
                  <h3>{i.title}</h3>
                  <span className={`ws-badge is-${i.status}`}>{t.ideaStatus[i.status]}</span>
                </div>
                {i.body && <p className="ws-clamp">{i.body}</p>}
                <div className="ws-project-foot">
                  <TagChips ids={i.tag_ids} all={tags} />
                  <span className="ws-hint">
                    {i.source === "voz" && (
                      <>
                        <Mic size={14} aria-label={t.ideas.fromVoice} />{" "}
                      </>
                    )}
                    {fmtShort(dayKey(i.created_at))}
                  </span>
                </div>

                <div className="ws-idea-actions">
                  <select name="status" defaultValue={i.status} aria-label={t.ideas.status}>
                    {IDEA_STATUSES.map((x) => (
                      <option key={x} value={x}>
                        {t.ideaStatus[x]}
                      </option>
                    ))}
                  </select>
                  <button type="submit" formAction={setIdeaStatus} className="ws-btn ghost small">
                    {t.common.save}
                  </button>
                  {i.project_id ? (
                    <Link className="ws-link-btn" href={`/workspace/proyectos/${i.project_id}`}>
                      {t.ideas.viewProject}
                    </Link>
                  ) : (
                    <button type="submit" formAction={convertIdea} className="ws-btn small">
                      {t.ideas.toProject}
                    </button>
                  )}
                </div>

                <details className="ws-danger">
                  <summary>{t.common.delete}</summary>
                  <p>{t.common.deleteHint}</p>
                  <button type="submit" formAction={deleteIdea} className="ws-btn danger small">
                    {t.common.confirmDelete}
                  </button>
                </details>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
