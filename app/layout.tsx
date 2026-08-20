import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Instrument_Sans, Shippori_Mincho } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const jp = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jp",
  display: "swap",
});

const sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nothingmoe.com"),
  title: {
    default: "nothingmoe",
    template: "%s · nothingmoe",
  },
  description: "nothinghereisdarkshit",
  applicationName: "nothingmoe",
  keywords: [
    "nothingmoe",
    "anime",
    "otaku",
    "anikura",
    "anilight",
    "nekowatch",
    "index",
  ],
  authors: [{ name: "nothingmoe", url: "https://nothingmoe.com" }],
  openGraph: {
    title: "nothingmoe",
    description: "nothinghereisdarkshit",
    url: "https://nothingmoe.com",
    siteName: "nothingmoe",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "nothingmoe",
    description: "nothinghereisdarkshit",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0c0b0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${jp.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
