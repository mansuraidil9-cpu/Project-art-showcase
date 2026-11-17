import SiteHeader from "@/components/site-header";
import ChallengeCard from "@/components/challenge-card";
import GalleryPagination from "@/components/gallery-pagination";
import { getCurrentUser } from "@/lib/auth";
import { getChallenges } from "@/lib/challenges";
import { challengeStatuses, challengeFilters } from "@/lib/challenge-rules";

export const metadata = { title: "Challenge Kreatif | Atelier" };
export default async function ChallengesPage({ searchParams }) {
  const user = await getCurrentUser(), filters = challengeFilters(await searchParams);
  const gallery = filters.error ? null : await getChallenges(filters);
  return <div className="site-container">
    <SiteHeader user={user} />
    <main id="konten" className="pb-20 pt-10 sm:pt-16">
      <section className="grid gap-6 border-b border-[var(--line)] pb-10 lg:grid-cols-[1.2fr_1fr] lg:items-end sm:pb-12">
        <div><p className="eyebrow">Tema baru, sudut pandang baru</p><h1 className="page-heading mt-5 text-5xl leading-[1.04] sm:text-6xl">Challenge kreatif.</h1></div>
        <p className="max-w-lg text-sm leading-7 text-[var(--muted)] lg:justify-self-end">Temukan tema yang menggerakkan imajinasimu dan bagikan karya terbaikmu. Setiap tantangan membuka ruang untuk mencoba dan tumbuh bersama.</p>
      </section>

      <form method="get" action="/challenges" className="grid items-end gap-4 border-b border-[var(--line)] py-7 sm:grid-cols-[1fr_11rem_auto]">
        <div className="min-w-0"><label htmlFor="challenge-search" className="block text-xs font-semibold tracking-wide">Cari challenge atau Curator</label><input id="challenge-search" name="q" type="search" maxLength={100} defaultValue={filters.q} placeholder="Judul challenge atau nama Curator" className="mt-2 w-full border border-[var(--line)] bg-transparent px-4 py-3 text-sm" /></div>
        <div><label htmlFor="challenge-status" className="block text-xs font-semibold tracking-wide">Status</label><select id="challenge-status" name="status" defaultValue={filters.status} className="mt-2 w-full border border-[var(--line)] bg-transparent px-3 py-3 text-sm"><option value="all">Semua challenge</option>{Object.entries(challengeStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <button className="button-primary">Cari challenge</button>
      </form>

      {filters.error ? <p role="alert" className="mt-7 border border-red-900/25 bg-red-50 px-5 py-4 text-sm leading-7 text-red-900">{filters.error}</p> : <>
        <p className="mt-7 text-xs tracking-wide text-[var(--muted)]">{gallery.total} challenge ditemukan</p>
        {gallery.challenges.length ? <div className="mt-7 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{gallery.challenges.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} />)}</div> : <p className="mt-7 border-b border-[var(--line)] py-10 text-sm leading-7 text-[var(--muted)]">Belum ada challenge yang cocok. Coba kata kunci atau status lain.</p>}
        <GalleryPagination gallery={gallery} pathname="/challenges" filters={filters} label="Halaman daftar challenge" />
      </>}
    </main>
  </div>;
}
