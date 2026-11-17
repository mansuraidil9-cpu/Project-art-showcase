import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import ArtworkCard from "@/components/artwork-card";
import GalleryPagination from "@/components/gallery-pagination";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getGallery } from "@/lib/artworks";
import { galleryFilters } from "@/lib/artwork-rules";
import ChallengeCard from "@/components/challenge-card";
import { getChallenges, getFeaturedWinners } from "@/lib/challenges";
import WinnerCard from "@/components/winner-card";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const filters = galleryFilters(params);
  const filtered = Boolean(params.q || params.category || params.sort || params.page);
  let categories = [], gallery = null, popular = [], latest = [], problem = "";
  let challenges = null, challengeProblem = "";
  let featured = [], featuredProblem = "";
  try {
    categories = (await query("artworkCategories")).rows;
    if (filters.categoryId && !categories.some((category) => category.id === filters.categoryId)) filters.error = "Kategori yang dipilih sudah tidak tersedia.";
    if (!filters.error) {
      if (filtered) gallery = await getGallery(filters);
      else {
        const lists = await Promise.all([getGallery({ sort: "popular", pageSize: 6 }), getGallery({ pageSize: 6 })]);
        popular = lists[0].artworks; latest = lists[1].artworks;
      }
    }
  } catch (error) {
    console.error("Galeri belum tersedia:", error.code || "GALLERY_ERROR");
    problem = "Galeri belum dapat dimuat. Coba kembali beberapa saat lagi.";
  }
  try {
    if (filters.q.length > 100) challengeProblem = "Pencarian maksimal 100 karakter.";
    else challenges = await getChallenges({ q: filters.q, status: filters.q ? "all" : "active", pageSize: 3 });
  } catch (error) {
    console.error("Challenge belum tersedia:", error.code || "CHALLENGE_ERROR");
    challengeProblem = "Challenge belum dapat dimuat. Coba kembali beberapa saat lagi.";
  }
  if (!filtered) {
    try { featured = await getFeaturedWinners(); }
    catch (error) { console.error("Sorotan belum tersedia:", error.code || "FEATURED_ERROR");featuredProblem = "Sorotan karya belum dapat dimuat. Coba kembali beberapa saat lagi."; }
  }
  return <div className="mx-auto max-w-6xl px-5 sm:px-9">
    <SiteHeader user={user} />
    <main id="konten" className="pb-16">
      <section className="grid items-center gap-10 py-12 md:grid-cols-[1.25fr_1fr] md:py-16">
        <div><p className="text-xs font-semibold tracking-[0.22em] text-orange-800">SENI DAN SUDUT PANDANG</p><h1 className="mt-5 max-w-xl font-serif text-5xl leading-[1.12] sm:text-6xl">Setiap karya punya ruang untuk bercerita.</h1><p className="mt-6 max-w-lg leading-7 text-stone-600">Temukan ilustrasi, fotografi, dan desain dari kreator dengan cerita yang berbeda.</p><div className="mt-8 flex flex-wrap gap-4"><a href="#galeri" className="rounded-lg border border-stone-400 px-5 py-3 text-sm font-semibold text-stone-800">Jelajahi karya</a>{user?.role === "member" ? <Link href="/dashboard/member/artworks/new" className="rounded-lg bg-stone-800 px-5 py-3 text-sm font-semibold text-white hover:text-white">Unggah karya</Link> : !user && <Link href="/register" className="rounded-lg bg-stone-800 px-5 py-3 text-sm font-semibold text-white hover:text-white">Mulai berkarya</Link>}</div></div>
        <div className="relative min-h-72 overflow-hidden rounded-t-full bg-[#e6dac7] md:min-h-96"><Image src="/examples/art-01.svg" alt="Ilustrasi lanskap dengan palet warna tanah" fill priority unoptimized className="object-cover" /></div>
      </section>
      <section id="galeri" aria-labelledby="gallery-title" className="border-t border-stone-300 pt-8">
        <h2 id="gallery-title" className="font-serif text-3xl">Temukan inspirasi.</h2>
        <form action="/" method="get" className="mt-6 grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_11rem_11rem_auto]">
          <div className="min-w-0"><label htmlFor="gallery-search" className="block text-sm font-semibold">Cari karya atau kreator</label><input id="gallery-search" name="q" type="search" maxLength={100} defaultValue={filters.q} placeholder="Judul karya atau nama kreator" className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm" /></div>
          <div><label htmlFor="gallery-category" className="block text-sm font-semibold">Kategori</label><select id="gallery-category" name="category" defaultValue={filters.categoryId || ""} className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-sm"><option value="">Semua kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
          <div><label htmlFor="gallery-sort" className="block text-sm font-semibold">Urutan</label><select id="gallery-sort" name="sort" defaultValue={filters.sort} className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-sm"><option value="latest">Terbaru</option><option value="popular">Terpopuler</option></select></div>
          <button className="rounded-lg bg-stone-800 px-5 py-3 text-sm font-semibold text-white">Cari karya</button>
        </form>
        <p className="mt-3 text-xs leading-6 text-stone-500">Pencarian juga mencari judul challenge dan nama Curator. Filter kategori berlaku untuk karya.</p>
        {filtered && <Link href="/#galeri" className="mt-4 inline-block text-sm font-semibold text-stone-700 underline underline-offset-4">Reset pencarian</Link>}
        {(problem || filters.error) ? <p role="alert" className="mt-7 rounded-xl border border-stone-300 bg-white p-6 leading-7 text-stone-600">{problem || filters.error}</p> : filtered ? <>
          <p className="mt-8 text-sm text-stone-600">{gallery?.total || 0} karya ditemukan</p>
          {gallery?.artworks.length ? <div className="mt-6 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{gallery.artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}</div> : <p className="mt-6 rounded-xl border border-dashed border-stone-300 p-8 leading-7 text-stone-600">Belum ada karya yang cocok. Coba kata kunci atau kategori lain.</p>}
          {gallery && <GalleryPagination gallery={gallery} filters={filters} anchor="#galeri" />}
        </> : <div className="space-y-14 pt-10">
          {[["Karya populer", "Sudut pandang yang disukai komunitas.", popular], ["Baru dibagikan", "Cerita visual terbaru dari para kreator.", latest]].map(([title, subtitle, artworks]) => <section key={title} aria-label={title}>
            <h3 className="font-serif text-3xl">{title}</h3><p className="mt-2 text-sm text-stone-600">{subtitle}</p>
            {artworks.length ? <div className="mt-6 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}</div> : <p className="mt-6 rounded-xl border border-dashed border-stone-300 p-8 text-stone-600">Belum ada karya yang dibagikan. Jadilah bagian dari cerita pertama.</p>}
          </section>)}
        </div>}
      </section>
      {!filtered && <section id="featured" className="mt-14 rounded-2xl bg-[#eee7d8] p-5 sm:p-8" aria-labelledby="featured-title"><p className="text-xs font-semibold tracking-widest text-orange-900">PILIHAN PARA CURATOR</p><h2 id="featured-title" className="mt-3 font-serif text-3xl">Sorotan para pemenang.</h2><p className="mt-3 text-sm leading-7 text-stone-600">Karya terpilih dari challenge yang sudah berakhir, bersama cerita di balik pencapaiannya.</p>{featuredProblem ? <p role="alert" className="mt-6 rounded-xl bg-white p-5 text-sm leading-7 text-stone-600">{featuredProblem}</p> : featured.length ? <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{featured.map((winner) => <WinnerCard key={winner.id} winner={winner} showChallenge />)}</div> : <p className="mt-6 text-sm leading-7 text-stone-600">Karya pemenang akan hadir setelah Curator mengumumkan hasil challenge.</p>}</section>}
      <section id="challenge" className="mt-14 border-t border-stone-300 pt-8" aria-labelledby="home-challenges-title"><div className="flex flex-wrap items-center justify-between gap-4"><h2 id="home-challenges-title" className="font-serif text-3xl">{filters.q ? "Hasil pencarian challenge" : "Challenge yang sedang berlangsung"}</h2><Link href={"/challenges?" + new URLSearchParams({ q: filters.q, status: filters.q ? "all" : "active" })} className="text-sm font-semibold text-stone-800 underline underline-offset-4">Lihat semua challenge</Link></div>{challengeProblem ? <p role="alert" className="mt-6 rounded-xl border border-stone-300 bg-white p-6 text-sm leading-7 text-stone-600">{challengeProblem}</p> : challenges?.challenges.length ? <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{challenges.challenges.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} />)}</div> : <p className="mt-6 rounded-xl border border-dashed border-stone-300 p-7 leading-7 text-stone-600">{filters.q ? "Belum ada challenge yang cocok dengan pencarianmu." : "Belum ada challenge yang sedang berlangsung. Kunjungi daftar challenge untuk melihat jadwal berikutnya."}</p>}</section>
    </main>
    <footer className="border-t border-stone-300 py-6 text-xs leading-6 text-stone-500">Ruang Karya · Praktikum Pemrograman Web 2026 · Sistem Informasi, Universitas Hasanuddin</footer>
  </div>;
}

