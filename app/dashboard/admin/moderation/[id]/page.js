import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session-token";
import { AdminError, getArtworkReports } from "@/lib/admin";
import { parseId } from "@/lib/validation";
import { formatDate } from "@/lib/format";
import { DismissReportForm, TakeDownArtworkForm } from "@/components/moderation-forms";
import GalleryPagination from "@/components/gallery-pagination";

export const metadata = { title: "Tinjau Laporan | Admin Ruang Karya" };
export default async function ArtworkReportsPage({ params, searchParams }) {
  await requireUser({ roles: ["admin"] });
  const id = parseId((await params).id);
  if (!id) notFound();
  const search = await searchParams;
  let review;
  try { review = await getArtworkReports((await cookies()).get(SESSION_COOKIE)?.value, id, search.page); }
  catch (error) { if (error instanceof AdminError && error.code === "NOT_FOUND") notFound(); throw error; }
  const { artwork } = review;
  return <>
    <Link href="/dashboard/admin/moderation" className="text-sm text-stone-700 underline underline-offset-4">Kembali ke antrean moderasi</Link>
    <h1 className="mt-6 break-words font-serif text-4xl">Tinjau: {artwork.title}</h1><p className="mt-4 text-sm leading-7 text-stone-600">{review.total} laporan belum diproses. Baca konteksnya sebelum mengambil keputusan.</p>
    {search.notice === "dismissed" && <p role="status" className="mt-5 rounded-lg bg-stone-200 p-4 text-sm">Laporan diabaikan. Karya tetap tersedia.</p>}
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-2"><section className="min-w-0"><div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-stone-200 bg-stone-100"><Image src={artwork.file_path} alt={artwork.title} fill sizes="(max-width: 1023px) 100vw, 50vw" unoptimized={artwork.media_type === "image/svg+xml"} className="object-contain" /></div><p className="mt-4 break-words text-sm text-stone-600">{artwork.display_name} · {artwork.category}</p><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-stone-600">{artwork.description}</p><Link href={"/artworks/" + id} className="mt-5 inline-block text-sm font-semibold text-stone-800 underline underline-offset-4">Buka detail karya publik</Link>{review.total > 0 && <TakeDownArtworkForm artworkId={id} title={artwork.title} />}</section>
      <section className="min-w-0" aria-labelledby="reports-title"><h2 id="reports-title" className="font-serif text-2xl">Laporan yang menunggu</h2>{review.reports.length ? <div className="mt-5 space-y-5">{review.reports.map((report) => <article key={report.id} className="rounded-xl border border-stone-300 bg-white p-5"><h3 className="text-lg font-semibold">{report.reason}</h3><p className="mt-3 break-words text-xs leading-6 text-stone-500">Dilaporkan oleh {report.reporter_name} · {formatDate(report.created_at)} WITA</p><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-stone-700">{report.details}</p><DismissReportForm reportId={report.id} /></article>)}</div> : <p className="mt-5 rounded-xl border border-dashed border-stone-300 p-6 text-sm leading-7 text-stone-600">Semua laporan karya ini sudah diproses. Karya tetap tampil di galeri.</p>}<GalleryPagination gallery={review} pathname={"/dashboard/admin/moderation/" + id} label="Halaman laporan karya" /></section>
    </div>
  </>;
}
