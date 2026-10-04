import { createProject, updateProject } from "@/app/workspace/actions";
import { privateText } from "@/lib/private-content";
import { PROJECT_STATUSES, type Project, type Tag } from "@/lib/workspace/types";
import { TagPicker } from "./tags";

const t = privateText.workspace;

// Formulario de proyecto: crea uno nuevo o edita el existente.
export function ProjectForm({ project, tags }: { project?: Project; tags: Tag[] }) {
  return (
    <form action={project ? updateProject : createProject} className="ws-form">
      {project && <input type="hidden" name="id" value={project.id} />}

      <label className="ws-field">
        <span>{t.projects.name}</span>
        <input name="name" required maxLength={160} defaultValue={project?.name ?? ""} />
      </label>

      <div className="ws-fields two">
        <label className="ws-field">
          <span>{t.projects.client}</span>
          <input name="client" maxLength={160} defaultValue={project?.client ?? ""} />
        </label>
        <label className="ws-field">
          <span>{t.projects.status}</span>
          <select name="status" defaultValue={project?.status ?? "planificacion"}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t.projectStatus[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="ws-field">
        <span>{t.common.description}</span>
        <textarea name="description" rows={2} defaultValue={project?.description ?? ""} />
      </label>

      <div className="ws-fields two">
        <label className="ws-field">
          <span>{t.projects.start}</span>
          <input type="date" name="start_date" defaultValue={project?.start_date ?? ""} />
        </label>
        <label className="ws-field">
          <span>{t.projects.due}</span>
          <input type="date" name="due_date" defaultValue={project?.due_date ?? ""} />
        </label>
      </div>

      <div className="ws-fields two">
        <label className="ws-field">
          <span>{t.projects.repo}</span>
          <input
            type="url"
            name="repo_url"
            placeholder="https://github.com/…"
            defaultValue={project?.repo_url ?? ""}
          />
        </label>
        <label className="ws-field">
          <span>{t.projects.prod}</span>
          <input
            type="url"
            name="prod_url"
            placeholder="https://…"
            defaultValue={project?.prod_url ?? ""}
          />
        </label>
      </div>

      {project && (
        <label className="ws-field">
          <span>
            {t.projects.context} · {t.projects.contextHint}
          </span>
          <textarea name="context" rows={6} defaultValue={project.context} />
        </label>
      )}

      <TagPicker
        tags={tags}
        selected={project?.tag_ids}
        legend={t.common.tags}
        emptyText={t.common.noTags}
        createLabel={t.common.createTags}
      />

      <div className="ws-actions">
        <button type="submit" className="ws-btn">
          {t.common.save}
        </button>
      </div>
    </form>
  );
}
