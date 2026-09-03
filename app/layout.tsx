import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { THEME_STORAGE_KEY } from "@/lib/theme";

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
    "yumezone",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ececef" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

const themeBootScript = `
(function () {
  try {
    var key = ${JSON.stringify(THEME_STORAGE_KEY)};
    var stored = localStorage.getItem(key);
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = "dark";
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <SiteHeader />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
