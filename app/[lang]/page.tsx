import { notFound } from "next/navigation";
import { content, isLang } from "@/lib/content";
import { ExecView } from "@/components/public/site/exec-view";
import { StyleProvider } from "@/components/public/site/style-provider";
export function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = content(lang);
  return {
    title: "Criden · " + t.hero,
    description: t.intro,
    alternates: { languages: { es: "/es", en: "/en" } },
  };
}
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = content(lang);
  return (
    <StyleProvider labels={t.style} brand="CRIDEN">
      <ExecView lang={lang} />
    </StyleProvider>
  );
}
