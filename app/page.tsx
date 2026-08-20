import { Experience } from "@/components/experience";
import { Garden } from "@/components/garden";
import { Hero } from "@/components/hero";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "nothingmoe",
  url: "https://nothingmoe.com",
  description: "nothinghereisdarkshit",
};

export default function Home() {
  return (
    <Experience>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-baseline justify-between px-6 py-6 sm:px-10">
        <span className="font-sans text-[11px] tracking-[0.42em] text-paper/80 uppercase">
          nothingmoe
        </span>
        <span className="font-jp text-sm tracking-[0.35em] text-muted">間</span>
      </header>
      <main>
        <Hero />
        <Garden />
      </main>
      <footer className="relative z-10 px-6 pb-16 pt-8 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 border-t border-line pt-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-2xl tracking-wide text-paper/90">nothingmoe.com</p>
            <p className="mt-2 max-w-sm font-sans text-[12px] leading-relaxed tracking-[0.12em] text-muted">
              An index of immersive rooms. Otaku first. Cinema, later. The garden grows.
            </p>
          </div>
          <p className="font-jp text-xs tracking-[0.4em] text-faint">無 · 静</p>
        </div>
      </footer>
    </Experience>
  );
}
