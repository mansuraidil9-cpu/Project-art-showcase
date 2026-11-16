import SiteHeader from "@/components/site-header";
import ChallengeCard from "@/components/challenge-card";
import GalleryPagination from "@/components/gallery-pagination";
import { getCurrentUser } from "@/lib/auth";
import { getChallenges } from "@/lib/challenges";
import { challengeStatuses, challengeFilters } from "@/lib/challenge-rules";

export const metadata = { title: "Challenge Kreatif | Ruang Karya" };
export default async function ChallengesPage({ searchParams }) {
  const user = await getCurrentUser(), filters = challengeFilters(await searchParams);
  const gallery = filters.error ? null : await getChallenges(filters);
  return <div className="mx-auto max-w-6xl px-5 sm:px-9"><SiteHeader user={user} /><main id="konten" className="py-12"><p className="text-xs font-semibold tracking-widest text-orange-800">TEMA BARU, SUDUT PANDANG BARU</p><h1 className="mt-4 font-serif text-4xl">Challenge kreatif.</h1><p className="mt-4 max-w-2xl leading-7 text-stone-600">Temukan tema yang menggerakkan imajinasimu dan bagikan karya terbaikmu.</p>
    <form method="get" action="/challenges" className="mt-7 grid items-end gap-4 sm:grid-cols-[1fr_12rem_auto]"><div className="min-w-0"><label htmlFor="challenge-search" className="block text-sm font-semibold">Cari challenge atau Curator</label><input id="challenge-search" name="q" type="search" maxLength={100} defaultValue={filters.q} className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm" /></div><div><label htmlFor="challenge-status" className="block text-sm font-semibold">Status</label><select id="challenge-status" name="status" defaultValue={filters.status} className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm"><option value="all">Semua challenge</option>{Object.entries(challengeStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><button className="rounded-lg bg-stone-800 px-5 py-3 text-sm font-semibold text-white">Cari challenge</button></form>
    {filters.error ? <p role="alert" className="mt-7 rounded-lg bg-red-50 p-5 text-sm text-red-900">{filters.error}</p> : <><p className="mt-7 text-sm text-stone-600">{gallery.total} challenge ditemukan</p>{gallery.challenges.length ? <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{gallery.challenges.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} />)}</div> : <p className="mt-6 rounded-xl border border-dashed border-stone-300 p-8 leading-7 text-stone-600">Belum ada challenge yang cocok. Coba kata kunci atau status lain.</p>}<GalleryPagination gallery={gallery} pathname="/challenges" filters={filters} label="Halaman daftar challenge" /></>}
  </main></div>;
}
