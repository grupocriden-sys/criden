import type { Metadata } from "next";
import "./workspace.css";
import { requireAccount } from "@/lib/auth/account";
import { WorkspaceNav } from "@/components/workspace/nav";
import { privateText } from "@/lib/private-content";

export const metadata: Metadata = {
  title: "Sala de trabajo · Criden",
  robots: { index: false, follow: false },
};

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAccount("/workspace");
  return (
    <div className="ws">
      <WorkspaceNav email={user.email} labels={privateText.workspace.nav} />
      <main className="ws-main">{children}</main>
    </div>
  );
}
