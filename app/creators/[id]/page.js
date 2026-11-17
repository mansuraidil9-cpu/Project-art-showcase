import ArrowIcon from "@/components/arrow-icon";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site-header";
import ArtworkCard from "@/components/artwork-card";
import GalleryPagination from "@/components/gallery-pagination";
import { query } from "@/lib/db";
import { getGallery } from "@/lib/artworks";
import { galleryFilters } from "@/lib/artwork-rules";
import { parseId } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Profil Kreator | Atelier" };
function externalUrl(value) {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export default async function CreatorPage({ params, searchParams }) {
  const id = parseId((await params).id);
  if (!id) notFound();
  const creator = (await query("creatorPublic", [id])).rows[0];
  if (!creator) notFound();
  const user = await getCurrentUser();
  const filters = galleryFilters({ page: (await searchParams).page });
  const gallery = await getGallery({ creatorId: id, page: filters.page });
  const links = [["Website", creator.website_url], ["Instagram", creator.instagram_url], ["Behance", creator.behance_url]].map(([label, value]) => [label, externalUrl(value)]).filter(([, url]) => url);
  return <div className="site-container">
    <SiteHeader user={user} />
    <main id="konten" className="pb-20 pt-9 sm:pt-14">
      <Link href="/#galeri" className="text-link text-sm">Jelajahi galeri</Link>
      <section className="mt-9 grid gap-8 border-b border-[var(--line)] pb-10 sm:grid-cols-[10rem_1fr] sm:gap-10 sm:pb-14">
        <div className="flex aspect-[4/5] w-32 items-center justify-center overflow-hidden border border-[var(--line)] bg-[#e9e6db] font-serif text-4xl text-[var(--muted)] sm:w-full sm:text-5xl">
          {creator.avatar_path?.startsWith("/uploads/") ? <Image src={creator.avatar_path} alt={"Foto " + creator.display_name} width={320} height={400} className="h-full w-full object-cover" /> : creator.display_name.slice(0,2).toUpperCase()}
        </div>
        <div className="min-w-0 sm:pt-2">
          <p className="eyebrow">Kreator</p>
          <h1 className="page-heading mt-4 break-words text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">{creator.display_name}</h1>
          <p className="mt-5 max-w-2xl whitespace-pre-wrap break-words text-sm leading-7 text-[var(--muted)]">{creator.bio || "Kreator ini membagikan sudut pandangnya melalui karya."}</p>
          {links.length > 0 && <nav aria-label="Tautan kreator" className="mt-6 flex flex-wrap gap-x-6 gap-y-3">{links.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-link text-sm">{label} <ArrowIcon diagonal className="inline h-3 w-3" /></a>)}</nav>}
          {user?.role === "member" && user.id === id && <Link href="/dashboard/member/profile" className="button-secondary mt-7">Edit profil publik</Link>}
        </div>
      </section>

      <section id="karya-kreator" className="pt-9 sm:pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4"><h2 className="font-serif text-3xl sm:text-4xl">Karya yang dibagikan <span className="text-[var(--muted)]">({gallery.total})</span></h2><p className="eyebrow">Portofolio</p></div>
        {gallery.artworks.length ? <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{gallery.artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}</div> : <p className="mt-8 border-y border-[var(--line)] py-10 text-sm leading-7 text-[var(--muted)]">Kreator ini belum membagikan karya.</p>}
        <GalleryPagination gallery={gallery} pathname={"/creators/" + id} anchor="#karya-kreator" />
      </section>
    </main>
  </div>;
}

