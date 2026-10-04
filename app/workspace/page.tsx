import { privateText } from "@/lib/private-content";

export default function WorkspacePage() {
  const t = privateText.workspace;
  return (
    <main className="shell section">
      <h1>{t.title}</h1>
      <p>{t.text}</p>
    </main>
  );
}
