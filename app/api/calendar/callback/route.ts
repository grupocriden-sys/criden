import { NextResponse, type NextRequest } from "next/server";
import { requireAccount } from "@/lib/auth/account";
import { encrypt } from "@/lib/calendar/crypto";
import { isOwner, providers } from "@/lib/calendar";

// El proveedor vuelve aquí con un código que se cambia por el token de renovación.
export async function GET(request: NextRequest) {
  const { supabase } = await requireAccount("/workspace/conexiones");
  const { searchParams, origin } = request.nextUrl;
  const done = (query: string) => {
    const res = NextResponse.redirect(`${origin}/workspace/conexiones?${query}`);
    res.cookies.delete({ name: "cal_oauth", path: "/api/calendar" });
    return res;
  };

  const [state, providerId, owner] = (request.cookies.get("cal_oauth")?.value ?? "").split(".");
  const code = searchParams.get("code");
  const provider = providers[providerId];
  if (
    searchParams.get("error") ||
    !code ||
    !provider ||
    !isOwner(owner) ||
    state !== searchParams.get("state")
  ) {
    return done("error=denied");
  }

  let row;
  try {
    const t = await provider.connect(code);
    row = {
      provider: provider.id,
      owner,
      account_email: t.email,
      refresh_token_enc: encrypt(t.refreshToken),
      scope: t.scope,
    };
  } catch {
    return done("error=failed");
  }

  const { error } = await supabase
    .from("calendar_connections")
    .upsert(row, { onConflict: "provider,owner" });
  return done(error ? "error=failed" : "ok=1");
}
