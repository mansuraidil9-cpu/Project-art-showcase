import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session-token";
import { getModerationQueue } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import GalleryPagination from "@/components/gallery-pagination";

export const metadata = { title: "Moderasi Konten | Admin Ruang Karya" };
export default async function ModerationPage({ searchParams }) {
  await requireUser({ roles: ["admin"] });
  const params = await searchParams;
  const queue = await getModerationQueue((await cookies()).get(SESSION_COOKIE)?.value, params.page);
  const message = new Map([["taken-down", "Karya dan data terkait berhasil dihapus."], ["taken-down-files", "Karya dihapus, namun berkasnya belum dapat dibersihkan."]]).get(params.notice);
  return <>
    <p className="text-xs font-semibold tracking-widest text-orange-800">ADMIN / MODERASI</p><h1 className="mt-3 font-serif text-4xl">Tinjau laporan komunitas.</h1><p className="mt-4 max-w-2xl leading-7 text-stone-600">{queue.reports} laporan menunggu pada {queue.total} karya. Laporan terlama ditampilkan lebih dahulu.</p>
    {message && <p role="status" className="mt-6 rounded-lg bg-stone-200 p-4 text-sm leading-6">{message}</p>}
    {queue.artworks.length ? <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{queue.artworks.map((artwork) => <article key={artwork.id} className="min-w-0 overflow-hidden rounded-xl border border-stone-300 bg-white"><Link href={"/dashboard/admin/moderation/" + artwork.id} className="relative block aspect-[4/3] bg-stone-100" aria-label={"Tinjau laporan " + artwork.title}><Image src={artwork.file_path} alt={artwork.title} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" unoptimized={artwork.media_type === "image/svg+xml"} className="object-cover" /></Link><div className="p-5"><p className="text-xs font-semibold text-orange-900">{artwork.report_count} laporan menunggu</p><h2 className="mt-3 break-words text-xl font-semibold">{artwork.title}</h2><p className="mt-2 break-words text-sm text-stone-600">{artwork.display_name} · {artwork.category}</p><p className="mt-4 text-xs leading-6 text-stone-500">Laporan pertama: {formatDate(artwork.oldest_report)} WITA</p><ul aria-label="Alasan laporan" className="mt-3 flex flex-wrap gap-2">{artwork.reasons.map((reason) => <li key={reason} className="rounded-full bg-stone-100 px-3 py-1.5 text-xs text-stone-700">{reason}</li>)}</ul><Link href={"/dashboard/admin/moderation/" + artwork.id} className="mt-5 inline-block text-sm font-semibold text-stone-800 underline underline-offset-4">Tinjau laporan</Link></div></article>)}</div> : <section className="mt-8 rounded-xl border border-dashed border-stone-300 p-8"><h2 className="text-xl font-semibold">Antrean laporan sudah bersih.</h2><p className="mt-3 leading-7 text-stone-600">Belum ada laporan karya yang menunggu keputusan.</p></section>}
    <GalleryPagination gallery={queue} pathname="/dashboard/admin/moderation" label="Halaman antrean moderasi" />
  </>;
}
