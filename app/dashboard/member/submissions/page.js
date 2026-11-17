import Link from "next/link";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session-token";
import { getMySubmissions } from "@/lib/dashboard";
import { formatDateTime } from "@/lib/format";
import { challengeStatuses } from "@/lib/challenge-rules";
import ArtworkCard from "@/components/artwork-card";
import { WithdrawForm } from "@/components/challenge-forms";
import GalleryPagination from "@/components/gallery-pagination";

export const metadata = { title: "Submisi Saya | Ruang Karya" };
export default async function MySubmissionsPage({ searchParams }) {
  await requireUser({ roles: ["member"] });
  const search = await searchParams, gallery = await getMySubmissions((await cookies()).get(SESSION_COOKIE)?.value, search.page);
  return <>
    <p className="text-xs font-semibold tracking-widest text-orange-800">PERJALANAN CHALLENGE</p><h1 className="mt-3 font-serif text-4xl">Submisi saya.</h1><p className="mt-4 leading-7 text-stone-600">{gallery.total} submisi, diurutkan dari yang terbaru.</p>
    {search.notice === "withdrawn" && <p role="status" className="mt-6 rounded-lg bg-stone-200 p-4 text-sm leading-7">Submisi berhasil ditarik. Karya asli tetap ada di portofoliomu.</p>}
    {gallery.artworks.length ? <div className="mt-8 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{gallery.artworks.map((artwork) => <section key={artwork.submission_id} className="min-w-0 rounded-xl border border-stone-300 bg-white p-4"><ArtworkCard artwork={artwork} /><div className="mt-5 border-t border-stone-200 pt-4">{artwork.curator_status === "approved" ? <Link href={"/challenges/" + artwork.challenge_id} className="inline-block max-w-full break-words text-sm font-semibold text-stone-800 underline underline-offset-4">{artwork.challenge_title}</Link> : <p className="break-words text-sm font-semibold">{artwork.challenge_title}</p>}<p className="mt-3 text-xs font-semibold text-orange-900">{challengeStatuses[artwork.status]}</p><p className="mt-2 text-xs leading-6 text-stone-500">Dikirim {formatDateTime(artwork.submitted_at)} WITA<br />Batas waktu {formatDateTime(artwork.ends_at)} WITA</p>{artwork.rank ? <p className="mt-3 text-sm font-semibold text-orange-900">Juara {artwork.rank}</p> : artwork.status === "ended" && <p className="mt-3 text-sm leading-6 text-stone-600">{artwork.has_winners ? "Pemenang sudah diumumkan. Lihat hasil di halaman challenge." : "Menunggu pengumuman pemenang."}</p>}{artwork.curator_status !== "approved" ? <p className="mt-3 text-sm leading-6 text-stone-600">Penyelenggara belum tersedia. Partisipasi sementara ditutup.</p> : artwork.status !== "ended" && <WithdrawForm challengeId={artwork.challenge_id} fromList page={gallery.page} />}</div></section>)}</div> : <section className="mt-8 rounded-xl border border-dashed border-stone-300 p-8"><h2 className="text-xl font-semibold">Belum ada submisi.</h2><p className="mt-3 leading-7 text-stone-600">Temukan challenge yang sesuai dengan karyamu dan bagikan satu karya dari portofolio.</p><Link href="/challenges" className="mt-5 inline-block font-semibold text-stone-800 underline underline-offset-4">Jelajahi challenge</Link></section>}
    <GalleryPagination gallery={gallery} pathname="/dashboard/member/submissions" label="Halaman submisi saya" />
  </>;
}
