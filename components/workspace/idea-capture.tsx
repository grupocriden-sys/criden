"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { createIdea } from "@/app/workspace/actions";

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition;
}

// Captura rápida de ideas: escribir o dictar (el navegador del celular convierte la voz en texto).
export function IdeaCapture({
  back,
  labels,
}: {
  back: string;
  labels: { placeholder: string; save: string; dictate: string; stop: string; listening: string };
}) {
  const [value, setValue] = useState("");
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [source, setSource] = useState<"texto" | "voz">("texto");
  const rec = useRef<Recognition | null>(null);
  const base = useRef("");

  useEffect(() => {
    setSupported(Boolean(recognitionCtor()));
    return () => rec.current?.stop();
  }, []);

  function toggle() {
    if (listening) {
      rec.current?.stop();
      return;
    }
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = "es-EC";
    r.continuous = true;
    r.interimResults = true;
    base.current = value ? `${value.trimEnd()} ` : "";
    r.onresult = (e) => {
      const said = Array.from(e.results)
        .map((res) => res[0].transcript)
        .join("");
      setValue(base.current + said);
    };
    r.onend = () => setListening(false);
    rec.current = r;
    setSource("voz");
    setListening(true);
    r.start();
  }

  return (
    <form action={createIdea} onSubmit={() => rec.current?.stop()} className="ws-capture">
      <input type="hidden" name="back" value={back} />
      <input type="hidden" name="source" value={source} />
      <textarea
        name="text"
        rows={3}
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={labels.placeholder}
        aria-label={labels.placeholder}
      />
      <div className="ws-capture-actions">
        {supported && (
          <button
            type="button"
            className={`ws-btn ghost${listening ? " live" : ""}`}
            onClick={toggle}
            aria-pressed={listening}
          >
            {listening ? (
              <Square size={16} aria-hidden="true" />
            ) : (
              <Mic size={16} aria-hidden="true" />
            )}
            {listening ? labels.stop : labels.dictate}
          </button>
        )}
        {listening && (
          <span className="ws-hint" role="status">
            {labels.listening}
          </span>
        )}
        <button type="submit" className="ws-btn">
          {labels.save}
        </button>
      </div>
    </form>
  );
}
