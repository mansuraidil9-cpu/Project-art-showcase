import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session-token";
import { ChallengeError, getChallengeManagement } from "@/lib/challenges";
import { parseId } from "@/lib/validation";
import { formatDateTime } from "@/lib/format";
import ArtworkCard from "@/components/artwork-card";
import WinnerForm from "@/components/winner-form";
import GalleryPagination from "@/components/gallery-pagination";

export const metadata = { title: "Kelola Submisi | Atelier" };
export default async function ChallengeSubmissionsPage({ params, searchParams }) {
  await requireUser({ roles: ["curator"] });
  const id = parseId((await params).id);if (!id) notFound();
  const search = await searchParams;let data;
  try { data = await getChallengeManagement((await cookies()).get(SESSION_COOKIE)?.value, id, search.page); }
  catch (error) { if (error instanceof ChallengeError && error.code === "NOT_FOUND") notFound();throw error; }
  return <>
    <Link href="/dashboard/curator" className="text-sm text-[var(--ink)] underline underline-offset-4">Kembali ke challenge saya</Link><h1 className="mt-6 break-words page-heading">Submisi: {data.challenge.title}</h1><p className="mt-4 text-sm leading-7 text-[var(--muted)]">{data.gallery.total} karya diterima. Batas waktu {formatDateTime(data.challenge.ends_at)} WITA.</p><Link href={"/challenges/" + id} className="mt-4 inline-block text-sm font-semibold text-[var(--ink)] underline underline-offset-4">Lihat halaman publik</Link>
    {search.notice === "winners-saved" && <p role="status" className="mt-6 bg-[#e6e2d5] p-4 text-sm leading-7">Pilihan pemenang berhasil disimpan dan diumumkan.</p>}
    <section id="pemenang" className="mt-8 max-w-2xl panel p-5 sm:p-7"><h2 className="font-serif text-2xl">Tentukan pemenang</h2>{!data.ended ? <p className="mt-4 text-sm leading-7 text-[var(--muted)]">Pemilihan pemenang dibuka setelah challenge berakhir. Kamu sudah bisa meninjau karya peserta di bawah.</p> : data.candidates.length ? <WinnerForm challengeId={id} candidates={data.candidates} winners={data.winners} expectedVersion={data.expectedVersion} /> : <p className="mt-4 text-sm leading-7 text-[var(--muted)]">Belum ada submisi yang dapat dipilih sebagai pemenang.</p>}</section>
    <section className="mt-10" aria-labelledby="submissions-title"><h2 id="submissions-title" className="font-serif text-3xl">Galeri submisi</h2>{data.gallery.artworks.length ? <div className="mt-7 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{data.gallery.artworks.map((artwork) => <div key={artwork.submission_id} className="min-w-0"><ArtworkCard artwork={artwork} /><p className="mt-3 text-xs leading-6 text-[var(--muted)]">Dikirim {formatDateTime(artwork.submitted_at)} WITA</p>{artwork.rank && <p className="mt-2 text-sm font-semibold text-[var(--ink)]">Juara {artwork.rank}</p>}</div>)}</div> : <p className="mt-6 border border-dashed border-[var(--line)] p-7 leading-7 text-[var(--muted)]">Belum ada karya yang dikirim ke challenge ini.</p>}<GalleryPagination gallery={data.gallery} pathname={"/dashboard/curator/challenges/" + id + "/submissions"} label="Halaman galeri submisi Curator" /></section>
  </>;
}
