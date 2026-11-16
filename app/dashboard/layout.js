import { requireUser } from "@/lib/auth";
import SiteHeader from "@/components/site-header";
import DashboardNav from "@/components/dashboard-nav";

export default async function DashboardLayout({ children }) {
  const user = await requireUser();
  return <div className="mx-auto max-w-6xl px-5 sm:px-9">
    <SiteHeader user={user} />
    <DashboardNav role={user.role} />
    <main id="konten" className="py-10">{children}</main>
  </div>;
}

