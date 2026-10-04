export type TagColor = "blue" | "navy" | "teal" | "green" | "amber" | "coral" | "pink" | "purple";

export type Tag = { id: string; name: string; color: TagColor };

export type ProjectStatus =
  "idea" | "planificacion" | "desarrollo" | "revision" | "pausado" | "terminado" | "archivado";

export type Project = {
  id: string;
  name: string;
  description: string;
  client: string;
  status: ProjectStatus;
  repo_url: string;
  prod_url: string;
  context: string;
  start_date: string | null;
  due_date: string | null;
  tag_ids: string[];
  created_at: string;
  updated_at: string;
};

export type TaskStatus = "pendiente" | "por_revisar" | "hecha";

export type Task = {
  id: string;
  project_id: string | null;
  title: string;
  status: TaskStatus;
  note: string;
  due_date: string | null;
  done_at: string | null;
  tag_ids: string[];
  created_at: string;
};

export type EventOwner = "cristian" | "denis" | "ambos";

export type CalEvent = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  owner: EventOwner;
  project_id: string | null;
  task_id: string | null;
  notes: string;
  tag_ids: string[];
  google_event_id: string | null;
};

export type IdeaStatus =
  "idea" | "investigando" | "validando" | "aprobada" | "descartada" | "convertida";

export type Idea = {
  id: string;
  title: string;
  body: string;
  status: IdeaStatus;
  source: "texto" | "voz";
  project_id: string | null;
  related_ids: string[];
  tag_ids: string[];
  created_at: string;
};

export const PROJECT_STATUSES: ProjectStatus[] = [
  "idea",
  "planificacion",
  "desarrollo",
  "revision",
  "pausado",
  "terminado",
  "archivado",
];
export const TASK_STATUSES: TaskStatus[] = ["pendiente", "por_revisar", "hecha"];
export const IDEA_STATUSES: IdeaStatus[] = [
  "idea",
  "investigando",
  "validando",
  "aprobada",
  "descartada",
  "convertida",
];
export const EVENT_OWNERS: EventOwner[] = ["ambos", "cristian", "denis"];
