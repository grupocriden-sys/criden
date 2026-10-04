"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccount } from "@/lib/auth/account";
import { toISO } from "@/lib/workspace/dates";
import { TAG_COLORS } from "@/lib/workspace/tags";
import {
  EVENT_OWNERS,
  IDEA_STATUSES,
  PROJECT_STATUSES,
  TASK_STATUSES,
} from "@/lib/workspace/types";

// Acciones del servidor de la sala de trabajo. Cada una vuelve a validar la sesión
// y la base de datos aplica RLS: nadie fuera de la cuenta autorizada puede escribir.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const text = (fd: FormData, key: string, max = 2000) =>
  String(fd.get(key) ?? "")
    .trim()
    .slice(0, max);
const idOf = (fd: FormData, key: string) => {
  const v = text(fd, key, 40);
  return UUID.test(v) ? v : null;
};
const idList = (fd: FormData, key: string) =>
  fd
    .getAll(key)
    .map(String)
    .filter((v) => UUID.test(v));
const dateOf = (fd: FormData, key: string) => {
  const v = text(fd, key, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
};
const timeOf = (fd: FormData, key: string) => {
  const v = text(fd, key, 5);
  return /^\d{2}:\d{2}$/.test(v) ? v : null;
};
const urlOf = (fd: FormData, key: string) => {
  const v = text(fd, key, 300);
  return /^https?:\/\//i.test(v) ? v : "";
};
const oneOf = <T extends string>(value: string, list: readonly T[], fallback: T): T =>
  (list as readonly string[]).includes(value) ? (value as T) : fallback;

// Solo se aceptan rutas internas de la sala de trabajo como destino.
const backOf = (fd: FormData, fallback: string) => {
  const v = text(fd, "back", 200);
  return v.startsWith("/workspace") && !v.startsWith("//") ? v : fallback;
};
const withParam = (path: string, key: string, value: string) =>
  `${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(value)}`;
const fail = (path: string): never => redirect(withParam(path, "error", "1"));
const refresh = () => revalidatePath("/workspace", "layout");

async function db() {
  const { supabase } = await requireAccount("/workspace");
  return supabase;
}

/* ---------- Eventos ---------- */

function eventFields(fd: FormData) {
  const title = text(fd, "title", 200);
  const date = dateOf(fd, "date");
  if (!title || !date) return null;
  const allDay = fd.get("all_day") === "on";
  const start = allDay ? "00:00" : (timeOf(fd, "start") ?? "09:00");
  let end = allDay ? "23:59" : (timeOf(fd, "end") ?? start);
  if (end < start) end = start;
  return {
    title,
    starts_at: toISO(date, start),
    ends_at: toISO(date, end),
    all_day: allDay,
    owner: oneOf(text(fd, "owner", 10), EVENT_OWNERS, "ambos"),
    project_id: idOf(fd, "project_id"),
    task_id: idOf(fd, "task_id"),
    notes: text(fd, "notes"),
    tag_ids: idList(fd, "tag_ids"),
    date,
  };
}

const calendarPath = (date: string) => `/workspace/calendario?m=${date.slice(0, 7)}&d=${date}`;

export async function createEvent(fd: FormData) {
  const supabase = await db();
  const back = backOf(fd, "/workspace/calendario");
  const f = eventFields(fd);
  if (!f) return fail(back);
  const { date, ...row } = f;
  const { error } = await supabase.from("events").insert(row);
  if (error) return fail(back);
  refresh();
  redirect(back.startsWith("/workspace/calendario") ? calendarPath(date) : back);
}

export async function updateEvent(fd: FormData) {
  const supabase = await db();
  const id = idOf(fd, "id");
  const f = eventFields(fd);
  if (!id || !f) return fail("/workspace/calendario");
  const { date, ...row } = f;
  const { error } = await supabase.from("events").update(row).eq("id", id);
  if (error) return fail(calendarPath(date));
  refresh();
  redirect(calendarPath(date));
}

export async function deleteEvent(fd: FormData) {
  const supabase = await db();
  const id = idOf(fd, "id");
  const back = backOf(fd, "/workspace/calendario");
  if (id) await supabase.from("events").delete().eq("id", id);
  refresh();
  redirect(back);
}

/* ---------- Proyectos ---------- */

function projectFields(fd: FormData) {
  const name = text(fd, "name", 160);
  if (!name) return null;
  return {
    name,
    description: text(fd, "description"),
    client: text(fd, "client", 160),
    status: oneOf(text(fd, "status", 20), PROJECT_STATUSES, "planificacion"),
    repo_url: urlOf(fd, "repo_url"),
    prod_url: urlOf(fd, "prod_url"),
    context: text(fd, "context", 8000),
    start_date: dateOf(fd, "start_date"),
    due_date: dateOf(fd, "due_date"),
    tag_ids: idList(fd, "tag_ids"),
  };
}

export async function createProject(fd: FormData) {
  const supabase = await db();
  const row = projectFields(fd);
  if (!row) return fail("/workspace/proyectos");
  const { data, error } = await supabase.from("projects").insert(row).select("id").single();
  if (error || !data) return fail("/workspace/proyectos");
  refresh();
  redirect(`/workspace/proyectos/${data.id}`);
}

export async function updateProject(fd: FormData) {
  const supabase = await db();
  const id = idOf(fd, "id");
  const row = projectFields(fd);
  if (!id) return fail("/workspace/proyectos");
  const path = `/workspace/proyectos/${id}`;
  if (!row) return fail(path);
  const { error } = await supabase.from("projects").update(row).eq("id", id);
  if (error) return fail(path);
  refresh();
  redirect(path);
}

export async function deleteProject(fd: FormData) {
  const supabase = await db();
  const id = idOf(fd, "id");
  if (id) await supabase.from("projects").delete().eq("id", id);
  refresh();
  redirect("/workspace/proyectos");
}

/* ---------- Checklist ---------- */

export async function createTask(fd: FormData) {
  const supabase = await db();
  const projectId = idOf(fd, "project_id");
  const title = text(fd, "title", 200);
  const path = projectId ? `/workspace/proyectos/${projectId}` : "/workspace";
  if (!title || !projectId) return fail(path);
  const { error } = await supabase
    .from("tasks")
    .insert({ project_id: projectId, title, due_date: dateOf(fd, "due_date") });
  if (error) return fail(path);
  refresh();
  redirect(path);
}

// Cambia el estado y guarda la nota opcional de "qué se hizo".
export async function setTask(fd: FormData) {
  const supabase = await db();
  const id = idOf(fd, "id");
  const projectId = idOf(fd, "project_id");
  const path = projectId ? `/workspace/proyectos/${projectId}` : "/workspace";
  if (!id) return fail(path);
  const status = oneOf(text(fd, "status", 20), TASK_STATUSES, "pendiente");
  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      note: text(fd, "note"),
      done_at: status === "hecha" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return fail(path);
  refresh();
  redirect(path);
}

export async function deleteTask(fd: FormData) {
  const supabase = await db();
  const id = idOf(fd, "id");
  const projectId = idOf(fd, "project_id");
  if (id) await supabase.from("tasks").delete().eq("id", id);
  refresh();
  redirect(projectId ? `/workspace/proyectos/${projectId}` : "/workspace");
}

/* ---------- Ideas ---------- */

export async function createIdea(fd: FormData) {
  const supabase = await db();
  const back = backOf(fd, "/workspace/ideas");
  const raw = text(fd, "text", 6000);
  if (!raw) return fail(back);
  // La primera línea es el título; el resto, el detalle.
  const [first, ...rest] = raw.split(/\r?\n/);
  const { error } = await supabase.from("ideas").insert({
    title: first.trim().slice(0, 160) || raw.slice(0, 160),
    body: rest.join("\n").trim(),
    source: text(fd, "source", 5) === "voz" ? "voz" : "texto",
    tag_ids: idList(fd, "tag_ids"),
  });
  if (error) return fail(back);
  refresh();
  redirect(back);
}

export async function setIdeaStatus(fd: FormData) {
  const supabase = await db();
  const id = idOf(fd, "id");
  const back = backOf(fd, "/workspace/ideas");
  if (id) {
    await supabase
      .from("ideas")
      .update({ status: oneOf(text(fd, "status", 20), IDEA_STATUSES, "idea") })
      .eq("id", id);
  }
  refresh();
  redirect(back);
}

export async function convertIdea(fd: FormData) {
  const supabase = await db();
  const id = idOf(fd, "id");
  if (!id) return fail("/workspace/ideas");
  const { data: idea } = await supabase.from("ideas").select("*").eq("id", id).single();
  if (!idea) return fail("/workspace/ideas");
  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      name: idea.title,
      description: idea.body,
      status: "idea",
      tag_ids: idea.tag_ids,
    })
    .select("id")
    .single();
  if (error || !project) return fail("/workspace/ideas");
  await supabase
    .from("ideas")
    .update({ status: "convertida", project_id: project.id })
    .eq("id", id);
  refresh();
  redirect(`/workspace/proyectos/${project.id}`);
}

export async function deleteIdea(fd: FormData) {
  const supabase = await db();
  const id = idOf(fd, "id");
  if (id) await supabase.from("ideas").delete().eq("id", id);
  refresh();
  redirect(backOf(fd, "/workspace/ideas"));
}

/* ---------- Etiquetas ---------- */

export async function createTag(fd: FormData) {
  const supabase = await db();
  const name = text(fd, "name", 40);
  if (!name) return fail("/workspace/etiquetas");
  const color = oneOf(
    text(fd, "color", 10),
    TAG_COLORS.map((c) => c.key),
    "blue",
  );
  const { error } = await supabase.from("tags").insert({ name, color });
  if (error) return fail("/workspace/etiquetas");
  refresh();
  redirect("/workspace/etiquetas");
}

export async function deleteTag(fd: FormData) {
  const supabase = await db();
  const id = idOf(fd, "id");
  if (id) await supabase.from("tags").delete().eq("id", id);
  refresh();
  redirect("/workspace/etiquetas");
}
