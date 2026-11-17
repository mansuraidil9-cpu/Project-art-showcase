import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site-header";
import ArtworkCard from "@/components/artwork-card";
import WinnerCard from "@/components/winner-card";
import GalleryPagination from "@/components/gallery-pagination";
import { SubmissionForm, WithdrawForm } from "@/components/challenge-forms";
import { getCurrentUser } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session-token";
import { ChallengeError, getChallenge, getParticipation } from "@/lib/challenges";
import { challengeStatuses } from "@/lib/challenge-rules";
import { formatDateTime } from "@/lib/format";
import { parseId } from "@/lib/validation";

export const metadata = { title: "Detail Challenge | Ruang Karya" };

function Participation({ challenge, user, participation }) {
  if (participation?.submission) return <div className="mt-6 border-t border-stone-200 pt-5"><h3 className="font-semibold">Karya yang kamu kirim</h3><Link href={"/artworks/" + participation.submission.artwork_id} className="mt-3 inline-block max-w-full break-words text-sm font-semibold text-stone-800 underline underline-offset-4">{participation.submission.title}</Link>{challenge.status !== "ended" ? <WithdrawForm challengeId={challenge.id} /> : <p className="mt-4 text-sm leading-7 text-stone-600">Challenge sudah berakhir. Submisi tidak dapat ditarik.</p>}</div>;
  if (challenge.status !== "active") return <p className="mt-5 text-sm leading-7 text-stone-600">{challenge.status === "upcoming" ? "Submisi dibuka saat challenge dimulai." : "Penerimaan submisi sudah ditutup."}</p>;
  if (!user) return <p className="mt-5 text-sm leading-7 text-stone-600"><Link href="/login" className="font-semibold text-stone-800 underline underline-offset-4">Masuk sebagai Member</Link> untuk mengirim satu karya dari portofoliomu.</p>;
  if (!participation) return <p className="mt-5 text-sm leading-7 text-stone-600">Partisipasi challenge tersedia untuk Member.</p>;
  if (!participation.artworks.length) return <p className="mt-5 text-sm leading-7 text-stone-600">Portofoliomu masih kosong. <Link href="/dashboard/member/artworks/new" className="font-semibold text-stone-800 underline">Unggah karya terlebih dahulu</Link> untuk mengikuti challenge.</p>;
  return <SubmissionForm challengeId={challenge.id} artworks={participation.artworks} />;
}

export default async function ChallengeDetail({ params, searchParams }) {
  const id = parseId((await params).id);if (!id) notFound();
  const search = await searchParams;
  let detail;
  try { detail = await getChallenge(id, search.page); }
  catch (error) { if (error instanceof ChallengeError && error.code === "NOT_FOUND") notFound();throw error; }
  const { challenge, gallery, winners } = detail, user = await getCurrentUser();
  const owner = user?.role === "curator" && user.curator_status === "approved" && user.id === challenge.curator_id;
  const participation = user?.role === "member" ? await getParticipation((await cookies()).get(SESSION_COOKIE)?.value, id) : null;
  const notices = new Map([["created", "Challenge berhasil dibuat."], ["updated", "Challenge berhasil diperbarui."], ["updated-files", "Challenge diperbarui, namun banner lama belum dapat dibersihkan."], ["submitted", "Karyamu berhasil dikirim ke challenge."], ["withdrawn", "Submisi berhasil ditarik. Karya asli tetap ada di portofoliomu."]]);
  const message = notices.get(search.notice);
  return <div className="mx-auto max-w-6xl px-5 sm:px-9"><SiteHeader user={user} /><main id="konten" className="py-10"><Link href="/challenges" className="text-sm text-stone-700 underline underline-offset-4">Kembali ke daftar challenge</Link>
    {message && (owner || user?.role === "member") && <p role="status" className="mt-5 rounded-lg bg-stone-200 p-4 text-sm leading-7">{message}</p>}
    <div className="relative mt-7 aspect-[2/1] overflow-hidden rounded-xl bg-stone-200"><Image src={challenge.banner_path} alt={challenge.title} fill priority sizes="100vw" unoptimized={challenge.banner_path.endsWith(".svg")} className="object-cover" /></div>
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]"><div className="min-w-0"><p className="text-xs font-semibold text-orange-900">{challengeStatuses[challenge.status]}</p><h1 className="mt-3 break-words font-serif text-4xl leading-tight sm:text-5xl">{challenge.title}</h1><p className="mt-4 break-words text-sm text-stone-600">Dikurasi oleh {challenge.curator_name}</p><p className="mt-6 whitespace-pre-wrap break-words leading-7 text-stone-600">{challenge.description}</p><section className="mt-8"><h2 className="font-serif text-2xl">Aturan</h2><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-stone-600">{challenge.rules}</p></section><section className="mt-8"><h2 className="font-serif text-2xl">Hadiah</h2><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-stone-600">{challenge.prize}</p></section>{owner && <Link href={"/dashboard/curator/challenges/" + id + "/edit"} className="mt-8 inline-block rounded-lg border border-stone-400 px-5 py-3 text-sm font-semibold text-stone-800">Edit challenge</Link>}</div>
      <aside id="partisipasi" className="min-w-0 rounded-xl border border-stone-300 bg-white p-5 sm:p-6"><h2 className="font-serif text-2xl">Jadwal dan partisipasi</h2><dl className="mt-5 space-y-4 text-sm"><div><dt className="text-stone-500">Mulai</dt><dd className="mt-2 leading-6">{formatDateTime(challenge.starts_at)} WITA</dd></div><div><dt className="text-stone-500">Batas waktu</dt><dd className="mt-2 leading-6">{formatDateTime(challenge.ends_at)} WITA</dd></div></dl>
        <Participation challenge={challenge} user={user} participation={participation} />
      </aside>
    </div>
    <section id="pemenang" className="mt-14 border-t border-stone-300 pt-8" aria-labelledby="winners-title"><h2 id="winners-title" className="font-serif text-3xl">Pemenang challenge</h2>{winners.length ? <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{winners.map((winner) => <WinnerCard key={winner.rank} winner={winner} />)}</div> : <p className="mt-6 rounded-xl border border-dashed border-stone-300 p-7 leading-7 text-stone-600">{challenge.status === "ended" ? "Pemenang belum diumumkan." : "Pemenang akan diumumkan setelah challenge berakhir."}</p>}</section>
    <section id="submisi" className="mt-14 border-t border-stone-300 pt-8"><h2 className="font-serif text-3xl">Karya peserta <span className="text-stone-500">({gallery.total})</span></h2>{gallery.artworks.length ? <div className="mt-7 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{gallery.artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}</div> : <p className="mt-6 rounded-xl border border-dashed border-stone-300 p-7 leading-7 text-stone-600">Belum ada karya yang dikirim ke challenge ini.</p>}<GalleryPagination gallery={gallery} pathname={"/challenges/" + id} anchor="#submisi" label="Halaman karya peserta" /></section>
  </main></div>;
}
