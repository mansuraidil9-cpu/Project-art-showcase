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

export const metadata = { title: "Profil Kreator | Ruang Karya" };
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
  return <div className="mx-auto max-w-6xl px-5 sm:px-9"><SiteHeader user={user} /><main id="konten" className="py-12">
    <section className="flex flex-wrap items-start gap-6 border-b border-stone-300 pb-10"><div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-stone-200 text-3xl font-semibold text-stone-700">{creator.avatar_path?.startsWith("/uploads/") ? <Image src={creator.avatar_path} alt={"Foto " + creator.display_name} width={96} height={96} className="h-full w-full object-cover" /> : creator.display_name.slice(0,2).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="text-xs font-semibold tracking-widest text-orange-800">KREATOR</p><h1 className="mt-3 break-words font-serif text-4xl">{creator.display_name}</h1><p className="mt-4 max-w-2xl whitespace-pre-wrap break-words leading-7 text-stone-600">{creator.bio || "Kreator ini membagikan sudut pandangnya melalui karya."}</p>{links.length > 0 && <nav aria-label="Tautan kreator" className="mt-5 flex flex-wrap gap-5">{links.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-stone-800 underline underline-offset-4">{label}</a>)}</nav>}</div></section>
    {user?.role === "member" && user.id === id && <Link href="/dashboard/member/profile" className="mt-6 inline-block rounded-lg border border-stone-400 px-5 py-3 text-sm font-semibold text-stone-800">Edit profil publik</Link>}
    <section id="karya-kreator" className="pt-10"><h2 className="font-serif text-3xl">Karya yang dibagikan <span className="text-stone-500">({gallery.total})</span></h2>{gallery.artworks.length ? <div className="mt-7 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{gallery.artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}</div> : <p className="mt-7 rounded-xl border border-dashed border-stone-300 p-8 text-stone-600">Kreator ini belum membagikan karya.</p>}<GalleryPagination gallery={gallery} pathname={"/creators/" + id} anchor="#karya-kreator" /></section>
    <Link href="/#galeri" className="mt-10 inline-block text-sm text-stone-700 underline underline-offset-4">Jelajahi galeri</Link>
  </main></div>;
}

