import type { Metadata } from "next";
import { fontDisplay, fontSans } from "./fonts";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SiteNav } from "@/components/SiteNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ayoub Lamhamdi — Director & Cinematographer",
  description:
    "Moroccan director and cinematographer crafting visually driven work for advertising, digital, and television. Coca-Cola, Samsung, and more.",
  openGraph: {
    title: "Ayoub Lamhamdi — Director & Cinematographer",
    description:
      "Moroccan director and cinematographer crafting visually driven work for advertising, digital, and television.",
    type: "website",
  },
  metadataBase: new URL("https://ayoublamhamdi.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontDisplay.variable} ${fontSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://i.vimeocdn.com" />
        <link rel="preconnect" href="https://f.vimeocdn.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://fresnel.vimeocdn.com" />
      </head>
      <body className="bg-ink text-bone selection:bg-bone selection:text-ink">
        <SmoothScroll>
          <SiteNav />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
