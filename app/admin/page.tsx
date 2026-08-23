import { redirect } from "next/navigation";
import { Experience } from "@/components/experience";
import { AdminDashboard } from "@/components/admin-dashboard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSessionUser } from "@/lib/auth-server";
import { isModerator } from "@/lib/moderation";
import { fetchAllSites } from "@/lib/sites-server";

export default async function AdminPage() {
  const session = await getSessionUser();
  if (!session || !isModerator(session)) {
    redirect("/");
  }

  const sites = await fetchAllSites();

  return (
    <Experience>
      <SiteHeader />
      <AdminDashboard initialSites={sites} />
      <SiteFooter />
    </Experience>
  );
}
