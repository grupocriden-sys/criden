import "./globals.css";
import "./skins.css";
import { Sora, DM_Sans, Caveat, Space_Grotesk, Shippori_Mincho_B1 } from "next/font/google";
import { DEFAULT_STYLE, STYLE_IDS, STYLE_KEY } from "@/lib/styles";
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const dm = DM_Sans({ subsets: ["latin"], variable: "--font-dm" });
const hand = Caveat({ subsets: ["latin"], variable: "--font-hand", weight: "600" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });
// Serif del Templo; incluye los kanji decorativos (se descargan solo si se usan).
const mincho = Shippori_Mincho_B1({
  subsets: ["latin"],
  weight: ["500", "800"],
  variable: "--font-mincho",
});

// Se ejecuta antes de pintar: deja el estilo elegido (o el de por defecto) en <html data-style>,
// así no hay parpadeo al volver a la portada.
const initStyle = `(function(){var d=document.documentElement,s=${JSON.stringify(DEFAULT_STYLE)};try{var q=new URLSearchParams(location.search).get("estilo"),v=localStorage.getItem(${JSON.stringify(STYLE_KEY)}),ok=${JSON.stringify(STYLE_IDS)};if(ok.indexOf(q)>-1)s=q;else if(ok.indexOf(v)>-1)s=v}catch(e){}d.dataset.style=s})()`;

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initStyle }} />
      </head>
      <body
        className={`${sora.variable} ${dm.variable} ${hand.variable} ${grotesk.variable} ${mincho.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
