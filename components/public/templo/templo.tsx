"use client";

import { useEffect, useRef } from "react";
import { StyleButton } from "@/components/public/site/style-provider";
import { mountTemplo } from "./engine";
import type { TemploData } from "./types";
import "./templo.css";

// Esqueleto del Templo (cielo, mapa, controles, panel inicial, interior y pergamino).
// El dibujo y el movimiento los pone engine.ts; los textos vienen de `data.t`.
export default function Templo({ data }: { data: TemploData }) {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = data;
  const ui = t.templo;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return mountTemplo(el, data);
  }, [data.lang]); // el motor se monta una vez por idioma

  return (
    <div className="tp" ref={ref} lang={data.lang}>
      <div className="sky" id="sky" aria-hidden="true">
        <div className="stars" id="stars" />
        <div className="disc sun" id="sun" />
        <div className="disc moon" id="moon" />
        <i className="cloud" style={{ top: "12%", width: 170, animationDuration: "110s" }} />
        <i
          className="cloud"
          style={{
            top: "26%",
            width: 120,
            animationDuration: "150s",
            animationDelay: "-60s",
            opacity: 0.7,
          }}
        />
        <i
          className="cloud"
          style={{
            top: "6%",
            width: 220,
            animationDuration: "190s",
            animationDelay: "-120s",
            opacity: 0.55,
          }}
        />
      </div>
      <div className="tp-stage">
        <svg id="map" viewBox="0 0 2400 1400" role="group" aria-label={ui.mapLabel} />
      </div>
      <div className="petals" id="petals" aria-hidden="true" />

      <header className="hud">
        <div className="tp-brand">
          <b>CRIDEN.</b>
          <span>{t.siteLine}</span>
        </div>
        <div className="tools" role="toolbar" aria-label={ui.mapLabel}>
          <StyleButton className="stylebtn" />
          <button id="zin" type="button" aria-label={ui.zoomIn}>
            +
          </button>
          <button id="zout" type="button" aria-label={ui.zoomOut}>
            −
          </button>
          <button id="home" type="button">
            {ui.seeAll}
          </button>
          <button id="night" type="button" aria-pressed="false">
            {ui.night}
          </button>
          <button id="exit" type="button">
            {ui.exit}
          </button>
        </div>
      </header>

      <section className="intro" id="intro" aria-labelledby="introT">
        <button className="x" id="introX" type="button" aria-label={ui.closeIntro}>
          ×
        </button>
        <p className="k">{t.eyebrow}</p>
        <h1 id="introT">
          {t.headline.pre}
          <em>{t.headline.mark}</em>
          {t.headline.post}
        </h1>
        <p>{t.intro}</p>
        <div className="tp-chips">
          {t.services.map((s) => (
            <span key={s.title}>{s.title}</span>
          ))}
        </div>
        <div className="row">
          <button className="go" id="explore" type="button">
            {ui.explore}
          </button>
          <button className="go alt" id="talk" type="button">
            {t.contact}
          </button>
        </div>
      </section>

      <div className="hint" id="hint">
        {ui.hint}
      </div>
      <div className="interior" id="interior" aria-hidden="true">
        <div id="scene" />
        <div className="doors">
          <i />
          <i />
        </div>
        <div className="where" id="where" />
      </div>
      <nav className="halls" id="halls" aria-label={ui.hallsLabel} />

      <aside className="scroll" id="scroll" aria-live="polite" aria-labelledby="sTitle">
        <div className="roller" />
        <div className="paper" id="paper" />
        <div className="roller" />
        <button className="x" id="close" type="button" aria-label={ui.closePaper}>
          ×
        </button>
      </aside>
    </div>
  );
}
