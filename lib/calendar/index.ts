import type { SupabaseClient } from "@supabase/supabase-js";
import { decrypt, cryptoConfigured } from "./crypto";
import { google } from "./providers/google";
import type { CalendarProvider, Connection, ExtEvent, Owner, PushEvent } from "./types";
import type { CalEvent, Tag } from "@/lib/workspace/types";

// Registro de proveedores. Para sumar uno nuevo: crear lib/calendar/providers/<nombre>.ts
// y agregarlo aquí. El resto de la sala de trabajo no necesita cambios.
export const providers: Record<string, CalendarProvider> = { google };
export const providerList = Object.values(providers);

export const isOwner = (v: unknown): v is Owner => v === "cristian" || v === "denis";

export async function loadConnections(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("calendar_connections")
    .select("id,provider,owner,account_email,refresh_token_enc,created_at")
    .order("created_at");
  return (data ?? []) as Connection[];
}

const usable = (c: Connection) =>
  Boolean(providers[c.provider]?.configured()) && cryptoConfigured();

export type ExternalItem = ExtEvent & { owner: Owner; provider: string; connection_id: string };

// Eventos de los calendarios conectados en un rango. Si un calendario falla, el resto sigue.
// Los eventos creados desde Criden se omiten porque ya salen de la base de datos.
export async function loadExternalEvents(
  connections: Connection[],
  fromISO: string,
  toISO: string,
) {
  const events: ExternalItem[] = [];
  const failed: Connection[] = [];
  await Promise.all(
    connections.filter(usable).map(async (c) => {
      try {
        const list = await providers[c.provider].list(decrypt(c.refresh_token_enc), fromISO, toISO);
        for (const e of list) {
          if (e.criden_id) continue;
          events.push({ ...e, owner: c.owner, provider: c.provider, connection_id: c.id });
        }
      } catch {
        failed.push(c);
      }
    }),
  );
  return { events: events.sort((a, b) => a.starts_at.localeCompare(b.starts_at)), failed };
}

/* ---------- Enviar eventos de Criden a un calendario externo ---------- */

async function buildPush(supabase: SupabaseClient, e: CalEvent): Promise<PushEvent> {
  const [project, tags] = await Promise.all([
    e.project_id
      ? supabase.from("projects").select("name").eq("id", e.project_id).maybeSingle()
      : Promise.resolve({ data: null }),
    e.tag_ids.length
      ? supabase.from("tags").select("id,name,color").in("id", e.tag_ids)
      : Promise.resolve({ data: [] }),
  ]);
  const list = (tags.data ?? []) as Tag[];
  // La primera etiqueta (en el orden elegido) define el color del evento en el calendario externo.
  const first = e.tag_ids.map((id) => list.find((t) => t.id === id)).find(Boolean);
  return {
    id: e.id,
    title: e.title,
    starts_at: e.starts_at,
    ends_at: e.ends_at,
    all_day: e.all_day,
    notes: e.notes,
    projectName: (project.data as { name: string } | null)?.name,
    tagNames: list.map((t) => t.name),
    color: first?.color,
  };
}

async function connectionFor(supabase: SupabaseClient, id: string) {
  const { data } = await supabase
    .from("calendar_connections")
    .select("id,provider,owner,account_email,refresh_token_enc,created_at")
    .eq("id", id)
    .maybeSingle();
  const c = data as Connection | null;
  return c && usable(c) ? c : null;
}

// Cada función devuelve true si el calendario externo quedó al día. Un fallo externo
// nunca debe impedir guardar el evento en Criden.
export async function pushCreate(supabase: SupabaseClient, e: CalEvent, owner: Owner) {
  try {
    const { data } = await supabase
      .from("calendar_connections")
      .select("id,provider,owner,account_email,refresh_token_enc,created_at")
      .eq("owner", owner)
      .eq("provider", "google");
    const c = ((data ?? []) as Connection[]).find(usable);
    if (!c) return false;
    const externalId = await providers[c.provider].create(
      decrypt(c.refresh_token_enc),
      await buildPush(supabase, e),
    );
    await supabase
      .from("events")
      .update({ source: c.provider, external_id: externalId, connection_id: c.id })
      .eq("id", e.id);
    return true;
  } catch {
    return false;
  }
}

export async function pushUpdate(
  supabase: SupabaseClient,
  e: CalEvent,
  link: { connection_id: string; external_id: string },
) {
  try {
    const c = await connectionFor(supabase, link.connection_id);
    if (!c) return false;
    await providers[c.provider].update(
      decrypt(c.refresh_token_enc),
      link.external_id,
      await buildPush(supabase, e),
    );
    return true;
  } catch {
    return false;
  }
}

export async function pushRemove(
  supabase: SupabaseClient,
  link: { connection_id: string; external_id: string },
) {
  try {
    const c = await connectionFor(supabase, link.connection_id);
    if (!c) return false;
    await providers[c.provider].remove(decrypt(c.refresh_token_enc), link.external_id);
    return true;
  } catch {
    return false;
  }
}
