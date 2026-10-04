import Link from "next/link";
import { createEvent, deleteEvent, updateEvent } from "@/app/workspace/actions";
import { dayKey, fmtTime } from "@/lib/workspace/dates";
import { privateText } from "@/lib/private-content";
import { EVENT_OWNERS, type CalEvent, type Tag } from "@/lib/workspace/types";
import { TagPicker } from "./tags";

const t = privateText.workspace;

type Prefill = { title?: string; project_id?: string; task_id?: string };

// Formulario para crear o editar un evento. `back` es la dirección a la que se vuelve.
export function EventForm({
  event,
  date,
  back,
  projects,
  tags,
  prefill,
  cancelHref,
  error,
}: {
  event?: CalEvent;
  date: string;
  back: string;
  projects: { id: string; name: string }[];
  tags: Tag[];
  prefill?: Prefill;
  cancelHref?: string;
  error?: boolean;
}) {
  const editing = Boolean(event);
  const day = event ? dayKey(event.starts_at) : date;
  const start = event && !event.all_day ? fmtTime(event.starts_at) : "09:00";
  const end = event && !event.all_day ? fmtTime(event.ends_at) : "10:00";

  return (
    <>
      <form action={editing ? updateEvent : createEvent} className="ws-form">
        <h3>{editing ? t.calendar.editEvent : t.calendar.newEvent}</h3>
        {error && (
          <p className="ws-error" role="alert">
            {t.common.error}
          </p>
        )}
        {event && <input type="hidden" name="id" value={event.id} />}
        <input type="hidden" name="back" value={back} />
        <input type="hidden" name="task_id" value={event?.task_id ?? prefill?.task_id ?? ""} />

        <label className="ws-field">
          <span>{t.calendar.eventTitle}</span>
          <input
            name="title"
            required
            maxLength={200}
            defaultValue={event?.title ?? prefill?.title ?? ""}
          />
        </label>

        <label className="ws-field">
          <span>{t.calendar.date}</span>
          <input type="date" name="date" required defaultValue={day} />
        </label>
        <div className="ws-fields two">
          <label className="ws-field">
            <span>{t.calendar.start}</span>
            <input type="time" name="start" defaultValue={start} />
          </label>
          <label className="ws-field">
            <span>{t.calendar.end}</span>
            <input type="time" name="end" defaultValue={end} />
          </label>
        </div>

        <label className="ws-check">
          <input type="checkbox" name="all_day" defaultChecked={event?.all_day} />
          <span>{t.common.allDay}</span>
        </label>

        <div className="ws-fields two">
          <label className="ws-field">
            <span>{t.calendar.who}</span>
            <select name="owner" defaultValue={event?.owner ?? "ambos"}>
              {EVENT_OWNERS.map((o) => (
                <option key={o} value={o}>
                  {t.owners[o]}
                </option>
              ))}
            </select>
          </label>
          <label className="ws-field">
            <span>{t.calendar.project}</span>
            <select name="project_id" defaultValue={event?.project_id ?? prefill?.project_id ?? ""}>
              <option value="">{t.common.noProject}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <TagPicker
          tags={tags}
          selected={event?.tag_ids}
          legend={t.common.tags}
          emptyText={t.common.noTags}
          createLabel={t.common.createTags}
        />

        <label className="ws-field">
          <span>{t.calendar.notes}</span>
          <textarea name="notes" rows={2} defaultValue={event?.notes ?? ""} />
        </label>

        <div className="ws-actions">
          <button type="submit" className="ws-btn">
            {t.calendar.save}
          </button>
          {cancelHref && (
            <Link className="ws-btn ghost" href={cancelHref}>
              {t.common.cancel}
            </Link>
          )}
        </div>
      </form>

      {event && (
        <form action={deleteEvent} className="ws-inline">
          <input type="hidden" name="id" value={event.id} />
          <input type="hidden" name="back" value={back} />
          <details className="ws-danger">
            <summary>{t.common.delete}</summary>
            <p>{t.common.deleteHint}</p>
            <button type="submit" className="ws-btn danger">
              {t.common.confirmDelete}
            </button>
          </details>
        </form>
      )}
    </>
  );
}
