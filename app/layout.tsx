import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
  display: "swap",
});

const description =
  "nothing here is dog shit — that shady corner of the internet where the UI actually feels good.";

export const metadata: Metadata = {
  metadataBase: new URL("https://nothingmoe.com"),
  title: {
    default: "NothingMoe",
    template: "%s · NothingMoe",
  },
  description,
  applicationName: "NothingMoe",
  icons: {
    icon: [
      { url: "/mark-64.png", type: "image/png", sizes: "64x64" },
      { url: "/mark.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [{ url: "/mark-256.png", sizes: "256x256", type: "image/png" }],
    shortcut: ["/mark-64.png"],
  },
  keywords: [
    "nothingmoe",
    "nothing moe",
    "anime",
    "anilight",
    "luna-stream",
    "anikura",
    "nekowatch",
    "index",
  ],
  authors: [{ name: "NothingMoe", url: "https://nothingmoe.com" }],
  openGraph: {
    title: "NothingMoe",
    description,
    url: "https://nothingmoe.com",
    siteName: "NothingMoe",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NothingMoe",
    description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
