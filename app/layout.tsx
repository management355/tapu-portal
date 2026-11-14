import { NavTracker } from "./nav-tracker";
import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque/wght.css";
import "@fontsource-variable/inter/wght.css";
import "@fontsource/jetbrains-mono/700.css";
import "./globals.css";
import { getLang } from "@/lib/i18n";
import { LegalFooter } from "./legal-footer";

export const metadata: Metadata = {
  title: "taPu",
  description: "Knopf dran. Botschaft drin.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFFFF",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body>
        <NavTracker />
        {children}
        <LegalFooter />
      </body>
    </html>
  );
}
