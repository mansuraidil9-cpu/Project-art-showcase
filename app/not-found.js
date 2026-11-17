import Link from "next/link";
export default function NotFound() {
  return <main id="konten" className="site-container py-20"><p className="eyebrow">Atelier / 404</p><h1 className="page-heading mt-5 max-w-xl">Ruang ini belum tersedia.</h1><p className="mt-5 max-w-md text-sm leading-7 text-[var(--muted)]">Halaman atau karya yang kamu cari mungkin sudah dipindahkan. Masih banyak sudut pandang lain untuk ditemukan.</p><Link href="/" className="button-secondary mt-8">Kembali ke beranda</Link></main>;
}

