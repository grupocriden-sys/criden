import "./globals.css";
import { Sora, DM_Sans } from "next/font/google";
const sora = Sora({subsets:["latin"],variable:"--font-sora"});
const dm = DM_Sans({subsets:["latin"],variable:"--font-dm"});
export default function Layout({children}: {children: React.ReactNode}) { return <html><body className={`${sora.variable} ${dm.variable}`}>{children}</body></html>; }
