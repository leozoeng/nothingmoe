import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <img
        src="/mark.png"
        alt=""
        width={64}
        height={64}
        className="h-16 w-16 rounded-[1.1rem]"
      />
      <h1 className="chrome-text mt-8 font-display text-5xl font-bold tracking-[-0.04em]">
        dead end.
      </h1>
      <p className="mt-4 font-sans text-[13px] text-muted">nothing here either. go home.</p>
      <Link
        href="/"
        className="mt-10 font-sans text-[11px] tracking-[0.32em] text-muted uppercase"
      >
        back
      </Link>
    </div>
  );
}
