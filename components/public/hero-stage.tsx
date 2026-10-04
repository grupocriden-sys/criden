"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ProjectScreen } from "./project-screen";

export type StageItem = {
  key: string;
  name: string;
  summary: string;
  technologies: string[];
  visual: string;
  screenshot: string;
  accent: string;
  badge: string;
  href: string;
  cta: string;
};

// Ventana de proyectos del hero: el visitante elige una idea y ve ese proyecto.
// Todos los textos llegan por props desde el contenido editable.
export function HeroStage({
  items,
  hint,
  label,
  sticker,
}: {
  items: StageItem[];
  hint: string;
  label: string;
  sticker: string;
}) {
  const [index, setIndex] = useState(0);
  const [changed, setChanged] = useState(false);
  const item = items[index];

  const stickerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, y: 0, dx: 0, dy: 0, on: false });

  return (
    <div className="stage-wrap">
      <div className="picker" role="group" aria-label={label}>
        <span className="picker-note" aria-hidden="true">
          {hint}
          <svg
            viewBox="0 0 54 36"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 6 C 22 0, 40 10, 46 28" />
            <path d="M38 24 L46 29 L50 20" />
          </svg>
        </span>
        {items.map((it, i) => (
          <button
            key={it.key}
            type="button"
            aria-pressed={i === index}
            onClick={() => {
              setIndex(i);
              setChanged(true);
            }}
          >
            {it.name}
          </button>
        ))}
      </div>

      <div className="stage">
        <div
          className={`win${changed ? " swap" : ""}`}
          key={item.key}
          style={item.accent ? ({ "--accent": item.accent } as React.CSSProperties) : undefined}
        >
          <div className="win-top">
            <i />
            <i />
            <i />
            <span>{item.name}</span>
          </div>
          <ProjectScreen visual={item.visual} screenshot={item.screenshot} alt={item.name} />
        </div>
        <div
          ref={stickerRef}
          className="sticker"
          aria-hidden="true"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current.on = true;
            drag.current.x = e.clientX;
            drag.current.y = e.clientY;
            e.currentTarget.classList.add("dragging");
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d.on || !stickerRef.current) return;
            const nx = d.dx + e.clientX - d.x;
            const ny = d.dy + e.clientY - d.y;
            stickerRef.current.style.setProperty("--dx", `${nx}px`);
            stickerRef.current.style.setProperty("--dy", `${ny}px`);
          }}
          onPointerUp={(e) => {
            const d = drag.current;
            d.dx += e.clientX - d.x;
            d.dy += e.clientY - d.y;
            d.on = false;
            e.currentTarget.classList.remove("dragging");
          }}
          onPointerCancel={(e) => {
            drag.current.on = false;
            e.currentTarget.classList.remove("dragging");
          }}
        >
          {sticker}
        </div>
      </div>

      <div className="stage-cap" aria-live="polite">
        {item.badge && <span className="tag">{item.badge}</span>}
        <p>{item.summary}</p>
        {item.technologies.length > 0 && (
          <div className="chips">
            {item.technologies.map((v) => (
              <span key={v}>{v}</span>
            ))}
          </div>
        )}
        <Link className="text-link" href={item.href}>
          {item.cta} →
        </Link>
      </div>
    </div>
  );
}
