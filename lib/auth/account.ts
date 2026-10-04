import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

// Exige la cuenta autorizada de Criden. Se llama en cada layout privado.
// La lista de cuentas vive en la base de datos (public.allowed_accounts), no en el código.
export async function requireAccount(next: string) {
  if (!supabaseConfigured) redirect(`/login?next=${encodeURIComponent(next)}`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);

  // Si la función no existe o falla, se niega el acceso.
  const { data: allowed, error } = await supabase.rpc("is_allowed");
  if (error || allowed !== true) {
    await supabase.auth.signOut();
    redirect("/login?error=denied");
  }

  return { supabase, user };
}
