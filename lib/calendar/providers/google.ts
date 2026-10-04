import { addDays, dayKey, toISO, TZ } from "@/lib/workspace/dates";
import { googleColorId } from "@/lib/workspace/tags";
import type { CalendarProvider, ExtEvent, PushEvent } from "../types";

// Google Calendar (calendario principal de la cuenta conectada).
// Alcances mínimos: leer y escribir eventos, y consultar disponibilidad. Nada más.
const SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
];
const CAL = "https://www.googleapis.com/calendar/v3/calendars/primary";

const site = () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const googleRedirectUri = () => `${site()}/api/calendar/callback`;

const clientId = () => process.env.GOOGLE_CLIENT_ID ?? "";
const clientSecret = () => process.env.GOOGLE_CLIENT_SECRET ?? "";

async function tokenRequest(params: Record<string, string>) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId(), client_secret: clientSecret(), ...params }),
    signal: AbortSignal.timeout(8000),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`google token: ${json.error ?? res.status}`);
  return json as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
  };
}

// El token de acceso dura una hora; se reutiliza mientras sirva.
const cache = new Map<string, { token: string; exp: number }>();
async function accessToken(refreshToken: string) {
  const hit = cache.get(refreshToken);
  if (hit && hit.exp > Date.now() + 30_000) return hit.token;
  const t = await tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken });
  cache.set(refreshToken, { token: t.access_token, exp: Date.now() + t.expires_in * 1000 });
  return t.access_token;
}

async function call(refreshToken: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${CAL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${await accessToken(refreshToken)}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 204) return null;
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`google calendar: ${res.status}`);
  return json;
}

function toGoogle(e: PushEvent) {
  const day = dayKey(e.starts_at);
  let end = e.ends_at;
  // Google no acepta un evento con hora de fin igual a la de inicio.
  if (!e.all_day && Date.parse(end) <= Date.parse(e.starts_at)) {
    end = new Date(Date.parse(e.starts_at) + 30 * 60_000).toISOString();
  }
  return {
    summary: e.title,
    description: [e.projectName && `Proyecto: ${e.projectName}`, e.notes]
      .filter(Boolean)
      .join("\n\n"),
    ...(e.all_day
      ? { start: { date: day }, end: { date: addDays(day, 1) } }
      : { start: { dateTime: e.starts_at, timeZone: TZ }, end: { dateTime: end, timeZone: TZ } }),
    colorId: googleColorId(e.color),
    extendedProperties: { private: { criden_id: e.id, criden_tags: e.tagNames.join(",") } },
  };
}

type GEvent = {
  id: string;
  status?: string;
  summary?: string;
  htmlLink?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
  extendedProperties?: { private?: Record<string, string> };
};

function fromGoogle(g: GEvent): ExtEvent | null {
  if (g.status === "cancelled" || !g.start || !g.end) return null;
  const allDay = Boolean(g.start.date);
  const starts = allDay ? toISO(g.start.date!, "00:00") : g.start.dateTime!;
  const ends = allDay ? toISO(addDays(g.end.date!, -1), "23:59") : g.end.dateTime!;
  return {
    id: g.id,
    title: g.summary || "(sin título)",
    starts_at: new Date(starts).toISOString(),
    ends_at: new Date(ends).toISOString(),
    all_day: allDay,
    link: g.htmlLink,
    criden_id: g.extendedProperties?.private?.criden_id,
  };
}

export const google: CalendarProvider = {
  id: "google",
  label: "Google Calendar",
  envVars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  redirectUri: googleRedirectUri,

  configured: () => Boolean(clientId() && clientSecret()),

  authUrl(state) {
    const p = new URLSearchParams({
      client_id: clientId(),
      redirect_uri: googleRedirectUri(),
      response_type: "code",
      scope: SCOPES.join(" "),
      access_type: "offline",
      // Obliga a Google a entregar un token de renovación aunque la cuenta ya haya autorizado antes.
      prompt: "consent",
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
  },

  async connect(code) {
    const t = await tokenRequest({
      grant_type: "authorization_code",
      code,
      redirect_uri: googleRedirectUri(),
    });
    if (!t.refresh_token) throw new Error("google: no entregó token de renovación");
    const info = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${t.access_token}` },
      signal: AbortSignal.timeout(8000),
    }).then((r) => r.json());
    return { email: String(info.email ?? ""), refreshToken: t.refresh_token, scope: t.scope };
  },

  async list(refreshToken, fromISO, toISO_) {
    const q = new URLSearchParams({
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "250",
      timeMin: fromISO,
      timeMax: toISO_,
    });
    const json = (await call(refreshToken, `/events?${q}`)) as { items?: GEvent[] };
    return (json.items ?? []).map(fromGoogle).filter((e): e is ExtEvent => e !== null);
  },

  async create(refreshToken, event) {
    const json = (await call(refreshToken, "/events", {
      method: "POST",
      body: JSON.stringify(toGoogle(event)),
    })) as GEvent;
    return json.id;
  },

  async update(refreshToken, externalId, event) {
    await call(refreshToken, `/events/${encodeURIComponent(externalId)}`, {
      method: "PATCH",
      body: JSON.stringify(toGoogle(event)),
    });
  },

  async remove(refreshToken, externalId) {
    await call(refreshToken, `/events/${encodeURIComponent(externalId)}`, { method: "DELETE" });
  },

  async revoke(refreshToken) {
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: refreshToken }),
      signal: AbortSignal.timeout(8000),
    });
  },
};
