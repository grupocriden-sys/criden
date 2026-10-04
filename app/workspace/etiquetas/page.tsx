import { createClient } from "@/lib/supabase/server";
import { createTag, deleteTag } from "@/app/workspace/actions";
import { privateText } from "@/lib/private-content";
import { TAG_COLORS } from "@/lib/workspace/tags";
import type { Tag } from "@/lib/workspace/types";

const t = privateText.workspace;

export default async function TagsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("id,name,color").order("name");
  const tags = (data ?? []) as Tag[];

  return (
    <>
      <header className="ws-head">
        <div>
          <h1>{t.tags.title}</h1>
          <p className="ws-sub">{t.tags.text}</p>
        </div>
      </header>

      <div className="ws-grid two">
        <section className="ws-card" aria-labelledby="h-new">
          <h2 id="h-new">{t.tags.new}</h2>
          {error === "1" && (
            <p className="ws-error" role="alert">
              {t.common.error}
            </p>
          )}
          <form action={createTag} className="ws-form">
            <label className="ws-field">
              <span>{t.tags.name}</span>
              <input name="name" required maxLength={40} />
            </label>
            <fieldset className="ws-tagpick">
              <legend>{t.tags.color}</legend>
              {TAG_COLORS.map((c, i) => (
                <label key={c.key} className={`ws-chip tag-${c.key}`}>
                  <input type="radio" name="color" value={c.key} defaultChecked={i === 0} />
                  <span>{t.tagColors[c.key]}</span>
                </label>
              ))}
            </fieldset>
            <div className="ws-actions">
              <button type="submit" className="ws-btn">
                {t.common.add}
              </button>
            </div>
          </form>
        </section>

        <section className="ws-card" aria-labelledby="h-list">
          <h2 id="h-list">{t.common.tags}</h2>
          {tags.length === 0 ? (
            <p className="ws-empty">{t.common.noTags}</p>
          ) : (
            <ul className="ws-list">
              {tags.map((tag) => (
                <li key={tag.id} className="ws-row">
                  <span className={`ws-chip tag-${tag.color}`}>{tag.name}</span>
                  <form action={deleteTag}>
                    <input type="hidden" name="id" value={tag.id} />
                    <button type="submit" className="ws-btn ghost small danger">
                      {t.common.delete}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
