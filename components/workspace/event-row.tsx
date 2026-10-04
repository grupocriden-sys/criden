import Link from "next/link";
import { dayKey, fmtShort } from "@/lib/workspace/dates";
import { eventTimeLabel } from "@/lib/workspace/format";
import { privateText } from "@/lib/private-content";
import type { CalEvent, Tag } from "@/lib/workspace/types";
import { TagChips } from "./tags";

const t = privateText.workspace;

export function EventRow({
  event,
  tags,
  projectName,
  showDay,
  editHref,
}: {
  event: CalEvent;
  tags: Tag[];
  projectName?: string;
  showDay?: boolean;
  editHref?: string;
}) {
  const first = tags.find((x) => event.tag_ids.includes(x.id));
  return (
    <li className={`ws-event tag-${first?.color ?? "blue"}`}>
      <div className="ws-event-time">
        {showDay && <span>{fmtShort(dayKey(event.starts_at))}</span>}
        <span>{eventTimeLabel(event, t.common.allDay)}</span>
      </div>
      <div className="ws-event-body">
        {editHref ? <Link href={editHref}>{event.title}</Link> : <strong>{event.title}</strong>}
        <p>
          {t.owners[event.owner]}
          {projectName ? ` · ${projectName}` : ""}
        </p>
        <TagChips ids={event.tag_ids} all={tags} />
      </div>
    </li>
  );
}
