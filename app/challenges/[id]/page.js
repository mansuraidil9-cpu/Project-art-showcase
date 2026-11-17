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

export const metadata = { title: "Detail Challenge | Atelier" };

function Participation({ challenge, user, participation }) {
  if (participation?.submission) return <div className="mt-6 border-t border-[var(--line)] pt-5"><h3 className="text-sm font-semibold">Karya yang kamu kirim</h3><Link href={"/artworks/" + participation.submission.artwork_id} className="text-link mt-3 inline-block max-w-full break-words text-sm">{participation.submission.title}</Link>{challenge.status !== "ended" ? <WithdrawForm challengeId={challenge.id} /> : <p className="mt-4 text-sm leading-7 text-[var(--muted)]">Challenge sudah berakhir. Submisi tidak dapat ditarik.</p>}</div>;
  if (challenge.status !== "active") return <p className="mt-5 text-sm leading-7 text-[var(--muted)]">{challenge.status === "upcoming" ? "Submisi dibuka saat challenge dimulai." : "Penerimaan submisi sudah ditutup."}</p>;
  if (!user) return <p className="mt-5 text-sm leading-7 text-[var(--muted)]"><Link href="/login" className="text-link">Masuk sebagai Member</Link> untuk mengirim satu karya dari portofoliomu.</p>;
  if (!participation) return <p className="mt-5 text-sm leading-7 text-[var(--muted)]">Partisipasi challenge tersedia untuk Member.</p>;
  if (!participation.artworks.length) return <p className="mt-5 text-sm leading-7 text-[var(--muted)]">Portofoliomu masih kosong. <Link href="/dashboard/member/artworks/new" className="text-link">Unggah karya terlebih dahulu</Link> untuk mengikuti challenge.</p>;
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
  return <div className="site-container">
    <SiteHeader user={user} />
    <main id="konten" className="pb-20 pt-8 sm:pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4"><Link href="/challenges" className="text-link text-sm">Kembali ke daftar challenge</Link><p className="eyebrow">Challenge Atelier</p></div>
      {message && (owner || user?.role === "member") && <p role="status" className="mt-6 border border-[var(--line)] px-5 py-4 text-sm leading-7">{message}</p>}

      <div className="relative mt-8 aspect-[2/1] overflow-hidden bg-[#e9e6db]">
        <Image src={challenge.banner_path} alt={challenge.title} fill priority sizes="(max-width: 1439px) 100vw, 1344px" unoptimized={challenge.banner_path.endsWith(".svg")} className="object-cover" />
      </div>
      <div className="mt-8 grid items-start gap-10 lg:mt-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <div className="min-w-0">
          <p className="eyebrow">{challengeStatuses[challenge.status]}</p>
          <h1 className="page-heading mt-4 break-words text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">{challenge.title}</h1>
          <p className="mt-5 break-words text-sm text-[var(--muted)]">Dikurasi oleh {challenge.curator_name}</p>
          <p className="mt-8 max-w-2xl whitespace-pre-wrap break-words text-sm leading-7 text-[var(--muted)]">{challenge.description}</p>
          <section className="mt-10 border-t border-[var(--line)] pt-6"><h2 className="font-serif text-3xl">Aturan</h2><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--muted)]">{challenge.rules}</p></section>
          <section className="mt-9 border-t border-[var(--line)] pt-6"><h2 className="font-serif text-3xl">Hadiah</h2><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--muted)]">{challenge.prize}</p></section>
          {owner && <Link href={"/dashboard/curator/challenges/" + id + "/edit"} className="button-secondary mt-8">Edit challenge</Link>}
        </div>
        <aside id="partisipasi" className="min-w-0 border-y border-[var(--line)] py-7 lg:border-l lg:border-y-0 lg:py-0 lg:pl-8">
          <p className="eyebrow">Catat tanggalnya</p>
          <h2 className="mt-3 font-serif text-3xl">Jadwal dan partisipasi</h2>
          <dl className="mt-6 space-y-5 text-sm"><div><dt className="text-xs tracking-wide text-[var(--muted)]">Mulai</dt><dd className="mt-2 leading-7">{formatDateTime(challenge.starts_at)} WITA</dd></div><div><dt className="text-xs tracking-wide text-[var(--muted)]">Batas waktu</dt><dd className="mt-2 leading-7">{formatDateTime(challenge.ends_at)} WITA</dd></div></dl>
          <Participation challenge={challenge} user={user} participation={participation} />
        </aside>
      </div>

      <section id="pemenang" className="mt-16 border-t border-[var(--line)] pt-8 sm:mt-20" aria-labelledby="winners-title">
        <p className="eyebrow">Pilihan Curator</p><h2 id="winners-title" className="mt-3 font-serif text-3xl sm:text-4xl">Pemenang challenge</h2>
        {winners.length ? <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{winners.map((winner) => <WinnerCard key={winner.rank} winner={winner} />)}</div> : <p className="mt-6 border-b border-[var(--line)] py-7 text-sm leading-7 text-[var(--muted)]">{challenge.status === "ended" ? "Pemenang belum diumumkan." : "Pemenang akan diumumkan setelah challenge berakhir."}</p>}
      </section>
      <section id="submisi" className="mt-14 border-t border-[var(--line)] pt-8 sm:mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4"><h2 className="font-serif text-3xl sm:text-4xl">Karya peserta <span className="text-[var(--muted)]">({gallery.total})</span></h2><p className="eyebrow">Galeri submisi</p></div>
        {gallery.artworks.length ? <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{gallery.artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}</div> : <p className="mt-6 border-b border-[var(--line)] py-7 text-sm leading-7 text-[var(--muted)]">Belum ada karya yang dikirim ke challenge ini.</p>}
        <GalleryPagination gallery={gallery} pathname={"/challenges/" + id} anchor="#submisi" label="Halaman karya peserta" />
      </section>
    </main>
  </div>;
}
