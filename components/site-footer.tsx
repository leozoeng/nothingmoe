export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto flex items-center justify-between gap-4 px-6 pb-8 pt-10 sm:px-10 sm:pb-10">
      <p className="font-sans text-[11px] tracking-[0.14em] text-muted">nothingmoe.com</p>
      <a
        href="https://www.reddit.com/r/nothingmoe"
        target="_blank"
        rel="noreferrer noopener"
        className="font-sans text-[11px] tracking-[0.14em] text-muted transition-colors hover:text-chrome"
      >
        r/nothingmoe
      </a>
    </footer>
  );
}
