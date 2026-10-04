"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleButton({
  next,
  label,
  loading,
  providerError,
  disabled,
}: {
  next: string;
  label: string;
  loading: string;
  providerError: string;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function signIn() {
    setBusy(true);
    setError(false);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setBusy(false);
      setError(true);
    }
  }

  return (
    <>
      <button className="button" type="button" onClick={signIn} disabled={disabled || busy}>
        {busy ? loading : label}
      </button>
      {error && (
        <p className="auth-error" role="alert">
          {providerError}
        </p>
      )}
    </>
  );
}
