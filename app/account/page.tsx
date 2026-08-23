import { redirect } from "next/navigation";
import { AccountSettings } from "@/components/account-settings";
import { Experience } from "@/components/experience";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSessionUser } from "@/lib/auth-server";

export default async function AccountPage() {
  const session = await getSessionUser();
  if (!session) redirect("/");

  return (
    <Experience>
      <SiteHeader />
      <AccountSettings />
      <SiteFooter />
    </Experience>
  );
}
