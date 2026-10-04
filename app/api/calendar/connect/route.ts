import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { requireAccount } from "@/lib/auth/account";
import { cryptoConfigured } from "@/lib/calendar/crypto";
import { isOwner, providers } from "@/lib/calendar";

// Inicia la conexión de un miembro con un calendario externo (Google u otro proveedor).
export async function GET(request: NextRequest) {
  await requireAccount("/workspace/conexiones");
  const { searchParams, origin } = request.nextUrl;
  const provider = providers[searchParams.get("provider") ?? "google"];
  const owner = searchParams.get("owner");
  const back = (error: string) =>
    NextResponse.redirect(`${origin}/workspace/conexiones?error=${error}`);

  if (!provider || !isOwner(owner)) return back("failed");
  if (!provider.configured() || !cryptoConfigured()) return back("config");

  // El parámetro `state` evita que alguien más complete la conexión por nosotros.
  const state = randomBytes(16).toString("hex");
  const response = NextResponse.redirect(provider.authUrl(state));
  response.cookies.set("cal_oauth", `${state}.${provider.id}.${owner}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/api/calendar",
  });
  return response;
}
