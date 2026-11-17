import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getGallery } from "@/lib/artworks";
import { galleryFilters } from "@/lib/artwork-rules";
import ArtworkCard from "@/components/artwork-card";
import GalleryPagination from "@/components/gallery-pagination";

export const metadata = { title: "Karya Saya | Atelier" };
export default async function MyArtworks({ searchParams }) {
  const user = await requireUser({ roles: ["member"] });
  const params = await searchParams;
  const filters = galleryFilters({ page: params.page });
  const gallery = await getGallery({ ...filters, creatorId: user.id });
  const message = new Map([["deleted", "Karya berhasil dihapus."], ["deleted-files", "Karya dihapus, namun berkasnya belum dapat dibersihkan."]]).get(params.notice);
  return <>
    <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="eyebrow">PORTOFOLIO PRIBADI</p><h1 className="mt-3 page-heading">Karya saya.</h1><p className="mt-4 text-sm leading-7 text-[var(--muted)]">{gallery.total} karya dalam perjalanan kreatifmu.</p></div><Link href="/dashboard/member/artworks/new" className="button-primary">Unggah karya</Link></div>
    {message && <p role="status" className="mt-6 bg-[#e6e2d5] p-4 text-sm">{message}</p>}
    {!gallery.artworks.length ? <div className="mt-8 border border-dashed border-[var(--line)] p-8"><h2 className="text-xl font-semibold">Ruang ini menunggu karya pertamamu.</h2><p className="mt-3 max-w-xl leading-7 text-[var(--muted)]">Bagikan ilustrasi, foto, atau desain yang ingin kamu ceritakan.</p><Link href="/dashboard/member/artworks/new" className="mt-5 inline-block font-semibold text-[var(--ink)] underline underline-offset-4">Mulai unggah karya</Link></div> : <div className="mt-8 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{gallery.artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} manage />)}</div>}
    <GalleryPagination gallery={gallery} pathname="/dashboard/member/artworks" />
  </>;
}

