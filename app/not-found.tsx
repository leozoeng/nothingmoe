import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="font-jp text-5xl text-paper/70">無</p>
      <h1 className="mt-8 font-display text-4xl tracking-[0.08em]">this room is empty</h1>
      <Link
        href="/"
        className="mt-10 font-sans text-[11px] tracking-[0.38em] text-muted uppercase"
      >
        return
      </Link>
    </div>
  );
}
