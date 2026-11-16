import SiteHeader from "@/components/site-header";

export default function AuthLayout({ children }) {
  return <div className="mx-auto max-w-6xl px-5 sm:px-9">
    <SiteHeader user={null} />
    <main id="konten" className="mx-auto max-w-md py-12 sm:py-16">{children}</main>
  </div>;
}

