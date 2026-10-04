import type { Metadata } from "next";
import { requireAccount } from "@/lib/auth/account";
import { PrivateBar } from "@/components/private/private-bar";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAccount("/workspace");
  return (
    <>
      <PrivateBar email={user.email} />
      {children}
    </>
  );
}
