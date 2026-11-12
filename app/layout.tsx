import type { Metadata, Viewport } from "next";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource-variable/manrope/wght.css";
import "@fontsource/jetbrains-mono/700.css";
import "./globals.css";
import { getLang } from "@/lib/i18n";
import { LegalFooter } from "./legal-footer";

export const metadata: Metadata = {
  title: "taPu",
  description: "Hinter jedem Knopf wartet eine Botschaft.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#15111C",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body>
        {children}
        <LegalFooter />
      </body>
    </html>
  );
}
