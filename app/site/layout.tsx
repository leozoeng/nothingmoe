import { Experience } from "@/components/experience";
import { MusicToggle } from "@/components/music-toggle";
import { SiteFooter } from "@/components/site-footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Experience>
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <MusicToggle />
    </Experience>
  );
}
