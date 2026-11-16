import Link from "next/link";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session-token";
import { getFavorites } from "@/lib/dashboard";
import ArtworkCard from "@/components/artwork-card";
import RemoveFavoriteForm from "@/components/favorite-form";
import GalleryPagination from "@/components/gallery-pagination";

export const metadata = { title: "Favorit Saya | Ruang Karya" };
export default async function FavoritesPage({ searchParams }) {
  await requireUser({ roles: ["member"] });
  const params = await searchParams;
  const gallery = await getFavorites((await cookies()).get(SESSION_COOKIE)?.value, params.page);
  return <>
    <p className="text-xs font-semibold tracking-widest text-orange-800">SIMPAN INSPIRASIMU</p><h1 className="mt-3 font-serif text-4xl">Favorit saya.</h1><p className="mt-4 leading-7 text-stone-600">{gallery.total} karya tersimpan, dari yang paling baru kamu simpan.</p>
    {params.notice === "removed" && <p role="status" className="mt-6 rounded-lg bg-stone-200 p-4 text-sm">Karya berhasil dihapus dari daftar favoritmu.</p>}
    {gallery.artworks.length ? <div className="mt-8 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{gallery.artworks.map((artwork) => <div key={artwork.id} className="min-w-0"><ArtworkCard artwork={artwork} /><RemoveFavoriteForm artworkId={artwork.id} page={gallery.page} /></div>)}</div> : <section className="mt-8 rounded-xl border border-dashed border-stone-300 p-8"><h2 className="text-xl font-semibold">Temukan karya yang ingin kamu simpan.</h2><p className="mt-3 max-w-xl leading-7 text-stone-600">Jelajahi galeri dan pilih Simpan ke favorit pada detail karya. Daftar ini hanya dapat diakses olehmu.</p><Link href="/#galeri" className="mt-5 inline-block font-semibold text-stone-800 underline underline-offset-4">Jelajahi galeri</Link></section>}
    <GalleryPagination gallery={gallery} pathname="/dashboard/member/favorites" label="Halaman favorit" />
  </>;
}
