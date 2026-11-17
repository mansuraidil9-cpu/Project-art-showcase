import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session-token";
import { getMemberOverview } from "@/lib/dashboard";
import ArtworkCard from "@/components/artwork-card";

export const metadata = { title: "Dashboard Member | Ruang Karya" };
export default async function MemberDashboard() {
  const user = await requireUser({ roles: ["member"] });
  const { statistics, artworks } = await getMemberOverview((await cookies()).get(SESSION_COOKIE)?.value);
  const totals = [["Karya dibagikan", statistics.artworks], ["Suka diterima", statistics.likes], ["Favorit tersimpan", statistics.favorites], ["Submisi terkirim", statistics.submissions]];
  return <>
    <p className="text-xs font-semibold tracking-widest text-orange-800">MEMBER</p><h1 className="mt-3 font-serif text-4xl">Halo, {user.display_name}.</h1>
    <p className="mt-4 max-w-2xl leading-7 text-stone-600">Bagikan karya terbaru dan rawat portofolio yang mewakili sudut pandangmu.</p>
    <div className="mt-7 flex flex-wrap gap-4"><Link href="/dashboard/member/artworks" className="rounded-lg bg-stone-800 px-5 py-3 text-sm font-semibold text-white hover:text-white">Kelola karya</Link><Link href={"/creators/" + user.id} className="rounded-lg border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-800">Lihat profil publik</Link></div>
    <dl aria-label="Ringkasan portofolio" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{totals.map(([label, total]) => <div key={label} className="min-w-0 rounded-xl border border-stone-300 bg-white p-5"><dt className="text-sm text-stone-600">{label}</dt><dd className="mt-3 text-3xl font-semibold">{total}</dd></div>)}</dl>
    <section className="mt-10" aria-labelledby="recent-artworks-title"><div className="flex flex-wrap items-center justify-between gap-4"><h2 id="recent-artworks-title" className="font-serif text-2xl">Karya terbarumu</h2><Link href="/dashboard/member/artworks" className="text-sm font-semibold text-stone-800 underline underline-offset-4">Lihat semua karya</Link></div>{artworks.length ? <div className="mt-6 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}</div> : <p className="mt-5 rounded-xl border border-dashed border-stone-300 p-6 text-sm leading-7 text-stone-600">Portofoliomu masih kosong. Mulai dengan membagikan karya pertamamu.</p>}</section>
    <section className="mt-10 grid gap-4 sm:grid-cols-3" aria-label="Pengaturan Member"><Link href="/dashboard/member/favorites" className="rounded-xl border border-stone-300 bg-white p-5 text-stone-800"><h2 className="font-semibold">Favorit saya</h2><p className="mt-3 text-sm leading-7 text-stone-600">Kunjungi kembali karya yang menginspirasimu.</p></Link><Link href="/dashboard/member/submissions" className="rounded-xl border border-stone-300 bg-white p-5 text-stone-800"><h2 className="font-semibold">Submisi saya</h2><p className="mt-3 text-sm leading-7 text-stone-600">Pantau challenge yang kamu ikuti dan hasil penilaiannya.</p></Link><Link href="/dashboard/member/profile" className="rounded-xl border border-stone-300 bg-white p-5 text-stone-800"><h2 className="font-semibold">Profil publik</h2><p className="mt-3 text-sm leading-7 text-stone-600">Perbarui foto, bio, dan tautan portofoliomu.</p></Link></section>
    <div className="mt-8 rounded-xl border border-stone-300 bg-white p-6"><h2 className="font-semibold">Informasi akun</h2><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-stone-500">Email privat</dt><dd className="mt-1 break-all">{user.email}</dd></div><div><dt className="text-stone-500">Peran</dt><dd className="mt-1">Member</dd></div></dl><Link href="/dashboard/member/account" className="mt-5 inline-block text-sm font-semibold text-stone-800 underline underline-offset-4">Pengaturan akun privat</Link></div>
  </>;
}

