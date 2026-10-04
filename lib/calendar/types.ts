import type { TagColor } from "@/lib/workspace/types";

export type Owner = "cristian" | "denis";

// Conexión guardada de un miembro con un calendario externo.
export type Connection = {
  id: string;
  provider: string;
  owner: Owner;
  account_email: string;
  refresh_token_enc: string;
  created_at: string;
};

// Evento que vive en un calendario externo.
export type ExtEvent = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  link?: string;
  // Id del evento de Criden si fue creado desde aquí (evita mostrarlo dos veces).
  criden_id?: string;
};

// Lo que se envía a un calendario externo al crear o editar un evento de Criden.
export type PushEvent = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  notes: string;
  projectName?: string;
  tagNames: string[];
  color?: TagColor;
};

// Un proveedor de calendario. Para sumar otro (Outlook, Apple…) se crea un archivo en
// lib/calendar/providers y se agrega al registro de lib/calendar/index.ts.
export interface CalendarProvider {
  id: string;
  label: string;
  // Variables de entorno que necesita y dirección de retorno que se registra en el proveedor.
  envVars: string[];
  redirectUri(): string;
  configured(): boolean;
  authUrl(state: string): string;
  connect(code: string): Promise<{ email: string; refreshToken: string; scope: string }>;
  list(refreshToken: string, fromISO: string, toISO: string): Promise<ExtEvent[]>;
  create(refreshToken: string, event: PushEvent): Promise<string>;
  update(refreshToken: string, externalId: string, event: PushEvent): Promise<void>;
  remove(refreshToken: string, externalId: string): Promise<void>;
  revoke?(refreshToken: string): Promise<void>;
}
