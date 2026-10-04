import type { Metadata } from "next";
import Link from "next/link";
import { privateText, type LoginError } from "@/lib/private-content";
import { supabaseConfigured } from "@/lib/supabase/env";
import { GoogleButton } from "@/components/private/google-button";

export const metadata: Metadata = {
  title: "Acceso · Criden",
  robots: { index: false, follow: false },
};

// Solo se aceptan rutas internas para evitar redirecciones a otros sitios.
function safeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/workspace";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const t = privateText.login;
  const errorKey: LoginError | undefined = !supabaseConfigured
    ? "config"
    : error && error in t.errors
      ? (error as LoginError)
      : undefined;

  return (
    <main className="auth">
      <div className="auth-card">
        <Link className="brand" href="/es" aria-label="Criden">
          <span className="mark">
            C<span>›</span>
          </span>
          CRIDEN<span className="brand-dot">.</span>
        </Link>
        <h1>{t.title}</h1>
        <p>{t.text}</p>
        {errorKey && (
          <p className="auth-error" role="alert">
            {t.errors[errorKey]}
          </p>
        )}
        <GoogleButton
          next={safeNext(next)}
          label={t.google}
          loading={t.loading}
          providerError={t.errors.provider}
          disabled={!supabaseConfigured}
        />
        <Link className="text-link" href="/es">
          ← {t.back}
        </Link>
      </div>
    </main>
  );
}
