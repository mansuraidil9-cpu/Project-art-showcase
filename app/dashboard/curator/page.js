import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session-token";
import { getOwnChallenges } from "@/lib/challenges";
import ChallengeCard from "@/components/challenge-card";
import GalleryPagination from "@/components/gallery-pagination";

export const metadata = { title: "Dashboard Curator | Atelier" };
export default async function CuratorDashboard({ searchParams }) {
  const user = await requireUser({ roles: ["curator"] }), params = await searchParams;
  const gallery = await getOwnChallenges((await cookies()).get(SESSION_COOKIE)?.value, params.page);
  const message = new Map([["deleted", "Challenge dan submisi terkait berhasil dihapus. Karya asli peserta tetap tersedia."], ["deleted-files", "Challenge dihapus, namun banner belum dapat dibersihkan."]]).get(params.notice);
  return <>
    <div className="flex flex-wrap items-start justify-between gap-5"><div className="min-w-0"><p className="eyebrow">CURATOR TERVERIFIKASI</p><h1 className="mt-3 break-words page-heading">Halo, {user.display_name}.</h1><p className="mt-4 leading-7 text-[var(--muted)]">{gallery.total} challenge dalam ruang kurasimu.</p></div><Link href="/dashboard/curator/challenges/new" className="button-primary">Buat challenge</Link></div>
    {message && <p role="status" className="mt-6 bg-[#e6e2d5] p-4 text-sm leading-7">{message}</p>}
    {gallery.challenges.length ? <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{gallery.challenges.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} manage />)}</div> : <section className="mt-8 border border-dashed border-[var(--line)] p-8"><h2 className="text-xl font-semibold">Mulai ruang eksplorasi pertamamu.</h2><p className="mt-3 leading-7 text-[var(--muted)]">Buat challenge dengan tema, aturan, hadiah, dan jadwal yang jelas untuk para kreator.</p></section>}
    <GalleryPagination gallery={gallery} pathname="/dashboard/curator" label="Halaman challenge saya" />
  </>;
}

