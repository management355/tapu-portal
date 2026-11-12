import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LegalFooter } from "./legal-footer";

export const metadata: Metadata = {
  title: "Tapu",
  description: "Ein Knopf. Eine Botschaft.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        {children}
        <LegalFooter />
      </body>
    </html>
  );
}
