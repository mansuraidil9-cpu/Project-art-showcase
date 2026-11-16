import Link from "next/link";
import AuthLinks from "./auth-links";

export default function SiteHeader({ user }) {
  return <header className="flex flex-wrap items-center justify-between gap-5 border-b border-stone-300 py-6">
    <Link href="/" aria-label="Ruang Karya, beranda" className="text-xl font-bold tracking-tight text-stone-800">ruang karya<span className="text-orange-800">.</span></Link>
    <AuthLinks user={user} />
  </header>;
}

