"use client";

import dynamic from "next/dynamic";
import { useStyle } from "@/components/public/site/style-provider";
import type { TemploData } from "@/components/public/templo/types";

// El Templo pesa más que el resto, así que solo se descarga cuando se elige ese estilo.
const Templo = dynamic(() => import("@/components/public/templo/templo"), { ssr: false });

export function TemploLayer(props: TemploData) {
  const { ready, style } = useStyle();
  if (!ready || style !== "templo") return null;
  return <Templo data={props} />;
}
