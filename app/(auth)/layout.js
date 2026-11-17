import ArrowIcon from "@/components/arrow-icon";
import SiteHeader from "@/components/site-header";
import Link from "next/link";

export default function AuthLayout({ children }) {
  return <div className="site-container">
    <SiteHeader user={null} />
    <main id="konten" className="grid gap-12 py-10 sm:py-14 lg:min-h-[76vh] lg:grid-cols-12 lg:items-start lg:gap-16 lg:py-20">
      <aside className="hidden lg:col-span-6 lg:block">
        <p className="eyebrow">Seni. Cerita. Pertemuan.</p>
        <p className="mt-6 max-w-lg font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">Ruang untuk melihat <span className="italic">lebih dekat.</span></p>
        <p className="mt-6 max-w-sm text-sm leading-7 text-stone-600">Temukan karya dengan sudut pandang baru, bagikan ceritamu, dan tumbuh bersama komunitas kreatif Atelier.</p>
        <Link href="/" className="text-link mt-7 inline-flex items-center gap-3 text-sm">Kembali ke beranda <ArrowIcon /></Link>
        <div className="mt-10 grid max-w-md grid-cols-2 gap-6 border-t border-[var(--line)] pt-5 text-xs leading-6 text-stone-600">
          <p><span className="mb-2 block text-stone-900">01 / Member</span>Bagikan karya dan temukan inspirasi dari sesama kreator.</p>
          <p><span className="mb-2 block text-stone-900">02 / Curator</span>Rancang challenge dan beri ruang bagi sudut pandang baru.</p>
        </div>
      </aside>
      <section className="w-full max-w-lg lg:col-span-5 lg:col-start-8 lg:border-l lg:border-[var(--line)] lg:pl-10"><Link href="/" className="text-link mb-8 inline-block text-xs lg:hidden">Kembali ke beranda</Link>{children}</section>
    </main>
    <footer className="border-t border-[var(--line)] py-5 text-xs text-stone-600">Atelier — tempat karya dan cerita bertemu.</footer>
  </div>;
}

