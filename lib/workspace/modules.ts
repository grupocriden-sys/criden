import {
  CalendarDays,
  FolderKanban,
  LayoutDashboard,
  Lightbulb,
  Plug,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { privateText } from "@/lib/private-content";

// Módulos de la sala de trabajo. Para agregar uno nuevo:
//   1. crear su carpeta en app/workspace/<ruta>/page.tsx
//   2. agregarlo aquí
//   3. agregar su nombre en content/private/es.json → workspace.nav
// La navegación (barra lateral y pestañas del celular) se arma sola desde esta lista.
export type ModuleKey = keyof typeof privateText.workspace.nav;

export type WorkspaceModule = {
  key: ModuleKey;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const MODULES: WorkspaceModule[] = [
  { key: "home", href: "/workspace", icon: LayoutDashboard, exact: true },
  { key: "calendar", href: "/workspace/calendario", icon: CalendarDays },
  { key: "projects", href: "/workspace/proyectos", icon: FolderKanban },
  { key: "ideas", href: "/workspace/ideas", icon: Lightbulb },
  { key: "tags", href: "/workspace/etiquetas", icon: Tag },
  { key: "connections", href: "/workspace/conexiones", icon: Plug },
];
