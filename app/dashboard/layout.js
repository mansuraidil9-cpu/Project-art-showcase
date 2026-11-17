import { requireUser } from "@/lib/auth";
import SiteHeader from "@/components/site-header";
import DashboardNav from "@/components/dashboard-nav";

export default async function DashboardLayout({ children }) {
  const user = await requireUser();
  return <div className="site-container">
    <SiteHeader user={user} />
    <DashboardNav role={user.role} />
    <main id="konten" className="min-w-0 pb-20 pt-10 sm:pt-14">{children}</main>
  </div>;
}

