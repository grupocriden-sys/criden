import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "./env";

// Cliente para componentes que corren en el navegador.
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
