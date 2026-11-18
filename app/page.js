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
import ArrowIcon from "@/components/arrow-icon";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const filters = galleryFilters(params);
  const filtered = Boolean(params.q || params.category || params.sort || params.page);
  const searchOpen = filtered || params.search === "open";
  let categories = [], gallery = null, popular = [], latest = [], problem = "";
  let challenges = null, challengeProblem = "";
  let featured = [], featuredProblem = "";
  try {
    categories = (await query("artworkCategories")).rows;
    if (filters.categoryId && !categories.some((category) => category.id === filters.categoryId)) filters.error = "Kategori yang dipilih sudah tidak tersedia.";
    if (!filters.error) {
      if (filtered) gallery = await getGallery(filters);
      else {
        const lists = await Promise.all([getGallery({ sort: "popular", pageSize: 4 }), getGallery({ pageSize: 8 })]);
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
  const creators = [...new Map([...popular, ...latest].map((artwork) => [artwork.member_id, artwork])).values()].slice(0, 4);
  return <div className="site-container">
    <SiteHeader user={user} />
    <main id="konten" className="pb-16">
      <section className="hero-layout" aria-labelledby="hero-title">
        <div><h1 id="hero-title" className="hero-title">RUANG BAGI<br />SENI <em>dan cerita.</em></h1><p className="mt-6 max-w-sm text-sm leading-6 text-[var(--muted)]">Jelajahi karya, kenali para kreator, dan temukan cara baru melihat hal-hal di sekitar kita.</p><div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4 text-xs"><a href="#galeri" className="text-link inline-flex items-center gap-5 py-2 uppercase tracking-wide">Jelajahi karya <ArrowIcon /></a>{user?.role === "member" ? <Link href="/dashboard/member/artworks/new" className="text-link py-2">Unggah karya</Link> : !user && <Link href="/register" className="text-link py-2">Mulai berkarya</Link>}</div></div>
        <figure><div className="hero-image"><Image src="/images/atelier-gallery-hd.webp" alt="Ruang galeri Tate Britain dengan lukisan berbingkai emas dan kanvas abstrak berwarna oker" fill priority quality={90} sizes="(max-width: 600px) 100vw, 52vw" className="object-cover" /></div><figcaption className="mt-2 flex justify-between gap-4 text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]"><span>Atelier — ruang untuk melihat</span><span>Tate Britain, London</span></figcaption></figure>
      </section>
      <section id="galeri" aria-labelledby="gallery-title" className={searchOpen ? "section-rule" : "pt-1"}>
        <h2 id="gallery-title" className="sr-only">Temukan inspirasi.</h2>
        {searchOpen && <form id="pencarian" action="/" method="get" aria-describedby="gallery-search-scope" className="grid items-end gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-[1fr_10rem_10rem_auto]">
          <div className="min-w-0"><label htmlFor="gallery-search" className="eyebrow">Cari karya atau kreator</label><input id="gallery-search" name="q" type="search" maxLength={100} defaultValue={filters.q} placeholder="Judul karya atau nama kreator" className="search-field" /></div>
          <div><label htmlFor="gallery-category" className="eyebrow">Kategori</label><select id="gallery-category" name="category" defaultValue={filters.categoryId || ""} className="search-field"><option value="">Semua kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
          <div><label htmlFor="gallery-sort" className="eyebrow">Urutan</label><select id="gallery-sort" name="sort" defaultValue={filters.sort} className="search-field"><option value="latest">Terbaru</option><option value="popular">Terpopuler</option></select></div>
          <button className="button-primary">Cari karya <ArrowIcon /></button>
        </form>}
        <p id="gallery-search-scope" className={filtered ? "mt-3 text-xs leading-6 text-stone-500" : "sr-only"}>Pencarian juga mencari judul challenge dan nama Curator. Filter kategori berlaku untuk karya.</p>
        {filtered && <Link href="/#galeri" className="mt-4 inline-block text-sm font-semibold text-stone-700 underline underline-offset-4">Reset pencarian</Link>}
        {(problem || filters.error) ? <p role="alert" className="mt-7 border border-stone-300 p-6 leading-7 text-stone-600">{problem || filters.error}</p> : filtered ? <>
          <p className="mt-8 text-sm text-stone-600">{gallery?.total || 0} karya ditemukan</p>
          {gallery?.artworks.length ? <div className="gallery-grid mt-6">{gallery.artworks.map((artwork, index) => <ArtworkCard key={artwork.id} artwork={artwork} index={index} />)}</div> : <p className="mt-6 border border-stone-300 p-8 leading-7 text-stone-600">Belum ada karya yang cocok. Coba kata kunci atau kategori lain.</p>}
          {gallery && <GalleryPagination gallery={gallery} filters={filters} anchor="#galeri" />}
        </> : <div className={"space-y-14 " + (searchOpen ? "pt-6" : "pt-0")}>
          {[["Karya populer", "Sudut pandang yang disukai komunitas.", popular], ["Baru dibagikan", "Cerita visual terbaru dari para kreator.", latest]].map(([title, subtitle, artworks]) => <section key={title} aria-label={title}>
            <h3 className={title === "Karya populer" ? "sr-only" : "font-serif text-3xl"}>{title}</h3><p className={title === "Karya populer" ? "sr-only" : "mt-2 text-sm text-stone-600"}>{subtitle}</p>
            {artworks.length ? <div className={"gallery-grid " + (title === "Karya populer" && !searchOpen ? "mt-0" : "mt-6")}>{artworks.map((artwork, index) => <ArtworkCard key={artwork.id} artwork={artwork} index={index} />)}</div> : <p className="mt-6 border border-stone-300 p-8 text-stone-600">Belum ada karya yang dibagikan. Jadilah bagian dari cerita pertama.</p>}
          </section>)}
        </div>}
      </section>
      {!filtered && <section id="featured" className="section-rule mt-16" aria-labelledby="featured-title"><p className="eyebrow">Pilihan para Curator</p><h2 id="featured-title" className="editorial-title mt-3">Sorotan para pemenang.</h2><p className="mt-3 max-w-lg text-sm leading-7 text-[var(--muted)]">Karya terpilih dari challenge yang sudah berakhir, bersama cerita di balik pencapaiannya.</p>{featuredProblem ? <p role="alert" className="panel mt-6 p-5 text-sm leading-7 text-[var(--muted)]">{featuredProblem}</p> : featured.length ? <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{featured.map((winner) => <WinnerCard key={winner.id} winner={winner} showChallenge />)}</div> : <p className="mt-6 text-sm leading-7 text-[var(--muted)]">Karya pemenang akan hadir setelah Curator mengumumkan hasil challenge.</p>}</section>}
      {!filtered && <section id="kreator" aria-labelledby="creators-title" className="section-rule mt-16"><div className="grid gap-8 md:grid-cols-[1fr_2fr]"><div><p className="eyebrow">Di balik setiap karya</p><h2 id="creators-title" className="editorial-title mt-3">Kenali<br /><em>kreatornya.</em></h2></div><div>{creators.length ? creators.map((creator, index) => <Link key={creator.member_id} href={"/creators/" + creator.member_id} className="flex items-center justify-between gap-5 border-b border-[var(--line)] py-5 first:pt-0"><span className="text-xs text-[var(--muted)]">{String(index + 1).padStart(2, "0")}</span><span className="min-w-0 flex-1 break-words font-serif text-2xl sm:text-3xl">{creator.display_name}</span><ArrowIcon diagonal className="h-5 w-5 shrink-0" /><span className="sr-only">Lihat portofolio</span></Link>) : <p className="text-sm leading-7 text-[var(--muted)]">Para kreator akan hadir bersama karya pertama mereka.</p>}</div></div></section>}
      <section id="challenge" className="mt-14 border-t border-stone-300 pt-8" aria-labelledby="home-challenges-title"><div className="flex flex-wrap items-center justify-between gap-4"><h2 id="home-challenges-title" className="font-serif text-3xl">{filters.q ? "Hasil pencarian challenge" : "Challenge yang sedang berlangsung"}</h2><Link href={"/challenges?" + new URLSearchParams({ q: filters.q, status: filters.q ? "all" : "active" })} className="text-sm font-semibold text-stone-800 underline underline-offset-4">Lihat semua challenge</Link></div>{challengeProblem ? <p role="alert" className="mt-6 border border-stone-300 p-6 text-sm leading-7 text-stone-600">{challengeProblem}</p> : challenges?.challenges.length ? <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{challenges.challenges.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} />)}</div> : <p className="mt-6 border border-stone-300 p-7 leading-7 text-stone-600">{filters.q ? "Belum ada challenge yang cocok dengan pencarianmu." : "Belum ada challenge yang sedang berlangsung. Kunjungi daftar challenge untuk melihat jadwal berikutnya."}</p>}</section>
    </main>
    <footer id="tentang" className="site-footer"><div className="grid gap-7 sm:grid-cols-[1fr_1fr]"><div><Link href="/" className="wordmark text-[var(--ink)]">Atelier</Link><p className="mt-4 max-w-xs text-xs leading-6 text-[var(--muted)]">Ruang bersama untuk karya, cerita, dan pertemuan kreatif. Terbuka bagi setiap sudut pandang.</p></div><div className="sm:justify-self-end"><p className="eyebrow">Mulai dari sebuah gagasan</p><p className="mt-3 font-serif text-2xl">Setiap karya layak menemukan ruangnya.</p><Link href={user?.role === "member" ? "/dashboard/member/artworks/new" : user ? "/#galeri" : "/register"} className="text-link mt-4 inline-block text-xs">{user?.role === "member" ? "Bagikan karyamu" : user ? "Jelajahi galeri" : "Menjadi bagian dari Atelier"}</Link></div></div><div className="mt-9 flex flex-wrap justify-between gap-3 border-t border-[var(--line)] pt-4 text-[10px] leading-5 text-[var(--muted)]"><p>Atelier · Praktikum Pemrograman Web 2026</p><p>Sistem Informasi, Universitas Hasanuddin</p></div><p className="mt-2 text-[10px] text-[var(--muted)]">Foto galeri: <a href="https://commons.wikimedia.org/wiki/File:Rothko_painting_in_Turner_gallery_Tate_Britain.jpg" className="text-link">Jp1008 / Wikimedia Commons</a>, CC0.</p></footer>
  </div>;
}

