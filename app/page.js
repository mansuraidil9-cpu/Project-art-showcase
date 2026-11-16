import Image from "next/image";
import SiteHeader from "@/components/site-header";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  let statistics = null;
  let artworks = [];
  try {
    statistics = (await query("platform")).rows[0];
    artworks = (await query("preview", [3])).rows;
  } catch (error) {
    console.error("Ringkasan belum tersedia:", error.code || "DB_CONFIG");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-9">
      <SiteHeader />
      <main id="konten" className="pb-20">
        <section className="grid gap-10 py-14 md:grid-cols-[1.3fr_1fr] md:py-20">
          <div>
            <p className="mb-5 text-xs font-semibold tracking-[0.22em] text-orange-800">ART SHOWCASE PLATFORM</p>
            <h1 className="max-w-xl font-serif text-5xl leading-[1.1] sm:text-6xl">Setiap karya punya ruang untuk bercerita.</h1>
            <p className="mt-6 max-w-md leading-7 text-stone-600">Tempat kreator membagikan sudut pandang, menemukan inspirasi, dan bertemu lewat tantangan kreatif.</p>
            <a href="#fondasi" className="mt-8 inline-block border-b border-stone-700 pb-1 text-sm font-semibold text-stone-800">Lihat fondasi platform ↓</a>
          </div>
          <div className="relative min-h-72 overflow-hidden rounded-t-full bg-[#e6dac7] md:min-h-96">
            <Image src="/examples/art-01.svg" alt="Ilustrasi contoh bentuk matahari dan lanskap berwarna tanah" fill priority className="object-cover" unoptimized />
          </div>
        </section>
        <section id="fondasi" aria-labelledby="status-title" className="border-y border-stone-300 py-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs tracking-widest text-stone-500">TAHAP 01 / FONDASI</p><h2 id="status-title" className="mt-2 font-serif text-2xl">Ruangnya sudah disiapkan.</h2></div>
            <span className="rounded-full bg-stone-200 px-4 py-2 text-xs text-stone-700">{statistics ? "Database terhubung" : "Database belum terhubung"}</span>
          </div>
          {statistics ? (
            <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[[statistics.members, "Kreator"], [statistics.artworks, "Karya contoh"], [statistics.curators, "Kurator"], [statistics.active_challenges, "Challenge aktif"]].map(([value, label]) => (
                <div key={label}><dt className="text-sm text-stone-600">{label}</dt><dd className="mt-1 text-3xl font-semibold">{value}</dd></div>
              ))}
            </dl>
          ) : (
            <p role="status" className="mt-6 max-w-2xl rounded-xl bg-white p-5 leading-7 text-stone-600">Data belum dapat dimuat. Pastikan PostgreSQL berjalan, konfigurasi lokal sudah diisi, serta schema.sql dan seed.sql sudah dijalankan. Setelah itu, muat ulang halaman.</p>
          )}
        </section>
        <section className="pt-10" aria-labelledby="sample-title">
          <h2 id="sample-title" className="font-serif text-2xl">Sekilas dari ruang kreatif</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">Contoh data untuk menguji fondasi. Galeri lengkap dan interaksi dibuat pada tahap berikutnya.</p>
          {artworks.length ? (
            <div className="mt-6 grid gap-7 sm:grid-cols-3">
              {artworks.map((art) => (
                <article key={art.id}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-stone-200"><Image src={art.file_path} alt={art.title} fill className="object-cover" unoptimized /></div>
                  <p className="mt-4 text-xs text-stone-500">{art.category}</p><h3 className="mt-1 font-semibold">{art.title}</h3><p className="mt-1 text-sm text-stone-600">{art.display_name}</p>
                </article>
              ))}
            </div>
          ) : <p className="mt-6 rounded-xl border border-dashed border-stone-300 p-7 text-sm text-stone-600">Belum ada karya yang bisa ditampilkan.</p>}
        </section>
      </main>
      <footer className="border-t border-stone-300 py-6 text-xs leading-6 text-stone-500">Ruang Karya · Praktikum Pemrograman Web 2026 · Sistem Informasi, Universitas Hasanuddin</footer>
    </div>
  );
}

