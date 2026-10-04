import "./globals.css";
import { Sora, DM_Sans, Caveat } from "next/font/google";
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const dm = DM_Sans({ subsets: ["latin"], variable: "--font-dm" });
const hand = Caveat({ subsets: ["latin"], variable: "--font-hand", weight: "600" });
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${sora.variable} ${dm.variable} ${hand.variable}`}>{children}</body>
    </html>
  );
}
