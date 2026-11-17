import Link from "next/link";
import AuthLinks from "./auth-links";

export default function SiteHeader({ user }) {
  return <header className="site-header">
    <a href="#konten" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-[var(--paper)] focus:p-3">Lewati navigasi</a>
    <Link href="/" aria-label="Atelier, beranda" className="wordmark text-[var(--ink)]">Atelier</Link>
    <nav aria-label="Navigasi utama" className="site-navigation">
      <Link href="/#galeri">Galeri</Link>
      <Link href="/#kreator">Kreator</Link>
      <Link href="/challenges">Challenge</Link>
      <Link href="/#tentang">Tentang</Link>
    </nav>
    <AuthLinks user={user} />
  </header>;
}

