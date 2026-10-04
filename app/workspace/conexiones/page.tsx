import { CheckCircle2, Plug } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { disconnectCalendar } from "@/app/workspace/actions";
import { cryptoConfigured } from "@/lib/calendar/crypto";
import { loadConnections, providerList } from "@/lib/calendar";
import type { Owner } from "@/lib/calendar/types";
import { privateText } from "@/lib/private-content";

const t = privateText.workspace;
const OWNERS: Owner[] = ["cristian", "denis"];

export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const supabase = await createClient();
  const connections = await loadConnections(supabase);
  const errorText =
    error && error in t.connections.errors
      ? t.connections.errors[error as keyof typeof t.connections.errors]
      : "";

  return (
    <>
      <header className="ws-head">
        <div>
          <h1>{t.connections.title}</h1>
          <p className="ws-sub">{t.connections.text}</p>
        </div>
      </header>

      {ok === "1" && (
        <p className="ws-ok" role="status">
          <CheckCircle2 size={18} aria-hidden="true" /> {t.connections.ok}
        </p>
      )}
      {errorText && (
        <p className="ws-error" role="alert">
          {errorText}
        </p>
      )}

      {providerList.map((p) => {
        const missing = [
          ...p.envVars,
          ...(cryptoConfigured() ? [] : ["TOKEN_ENCRYPTION_KEY"]),
        ].filter((name) => name === "TOKEN_ENCRYPTION_KEY" || !process.env[name]);
        const ready = p.configured() && cryptoConfigured();
        const label =
          t.connections.providers[p.id as keyof typeof t.connections.providers] ?? p.label;
        return (
          <section key={p.id} className="ws-card" aria-labelledby={`h-${p.id}`}>
            <h2 id={`h-${p.id}`}>{label}</h2>

            {!ready && (
              <div className="ws-setup">
                <p>
                  <strong>{t.connections.setupTitle}</strong> {t.connections.setupText}
                </p>
                <ul>
                  {missing.map((name) => (
                    <li key={name}>
                      <code>{name}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ul className="ws-list">
              {OWNERS.map((owner) => {
                const c = connections.find((x) => x.provider === p.id && x.owner === owner);
                return (
                  <li key={owner} className="ws-row">
                    <div>
                      <strong>{t.owners[owner]}</strong>
                      <p>
                        {c
                          ? `${t.connections.connectedAs} ${c.account_email}`
                          : t.connections.notConnected}
                      </p>
                    </div>
                    <div className="ws-row-actions">
                      {ready && (
                        <a
                          className={`ws-btn small${c ? " ghost" : ""}`}
                          href={`/api/calendar/connect?provider=${p.id}&owner=${owner}`}
                        >
                          <Plug size={16} aria-hidden="true" />
                          {c ? t.connections.reconnect : t.connections.connect}
                        </a>
                      )}
                      {c && (
                        <form action={disconnectCalendar}>
                          <input type="hidden" name="id" value={c.id} />
                          <details className="ws-danger">
                            <summary>{t.connections.disconnect}</summary>
                            <p>{t.connections.disconnectHint}</p>
                            <button type="submit" className="ws-btn danger small">
                              {t.connections.confirmDisconnect}
                            </button>
                          </details>
                        </form>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="ws-hint ws-redirect">
              {t.connections.redirectText} <code>{p.redirectUri()}</code>
            </p>
          </section>
        );
      })}

      <p className="ws-hint">{t.connections.later}</p>
    </>
  );
}
