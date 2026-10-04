import { privateText } from "@/lib/private-content";

export default function AdminPage() {
  const t = privateText.admin;
  return (
    <main className="shell section">
      <h1>{t.title}</h1>
      <p>{t.text}</p>
    </main>
  );
}
