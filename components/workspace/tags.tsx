import Link from "next/link";
import type { Tag } from "@/lib/workspace/types";
import { tagsOf } from "@/lib/workspace/tags";

// Casillas con forma de etiqueta para elegir etiquetas en un formulario (sin JavaScript).
export function TagPicker({
  tags,
  selected = [],
  legend,
  emptyText,
  createLabel,
}: {
  tags: Tag[];
  selected?: string[];
  legend: string;
  emptyText: string;
  createLabel: string;
}) {
  if (tags.length === 0) {
    return (
      <p className="ws-hint">
        {emptyText} <Link href="/workspace/etiquetas">{createLabel}</Link>
      </p>
    );
  }
  return (
    <fieldset className="ws-tagpick">
      <legend>{legend}</legend>
      {tags.map((t) => (
        <label key={t.id} className={`ws-chip tag-${t.color}`}>
          <input
            type="checkbox"
            name="tag_ids"
            value={t.id}
            defaultChecked={selected.includes(t.id)}
          />
          <span>{t.name}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function TagChips({ ids, all }: { ids: string[]; all: Tag[] }) {
  const list = tagsOf(ids, all);
  if (list.length === 0) return null;
  return (
    <ul className="ws-tags">
      {list.map((t) => (
        <li key={t.id} className={`ws-chip tag-${t.color}`}>
          {t.name}
        </li>
      ))}
    </ul>
  );
}
