import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session-token";
import { getMemberOverview } from "@/lib/dashboard";
import ArtworkCard from "@/components/artwork-card";

export const metadata = { title: "Dashboard Member | Atelier" };
export default async function MemberDashboard() {
  const user = await requireUser({ roles: ["member"] });
  const { statistics, artworks } = await getMemberOverview((await cookies()).get(SESSION_COOKIE)?.value);
  const totals = [["Karya dibagikan", statistics.artworks], ["Suka diterima", statistics.likes], ["Favorit tersimpan", statistics.favorites], ["Submisi terkirim", statistics.submissions]];
  return <>
    <p className="eyebrow">MEMBER</p><h1 className="mt-3 break-words page-heading">Halo, {user.display_name}.</h1>
    <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">Bagikan karya terbaru dan rawat portofolio yang mewakili sudut pandangmu.</p>
    <div className="mt-7 flex flex-wrap gap-4"><Link href="/dashboard/member/artworks" className="button-primary">Kelola karya</Link><Link href={"/creators/" + user.id} className="button-secondary">Lihat profil publik</Link></div>
    <dl aria-label="Ringkasan portofolio" className="mt-12 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">{totals.map(([label, total]) => <div key={label} className="min-w-0 border-t border-[var(--line)] py-5"><dt className="text-sm text-[var(--muted)]">{label}</dt><dd className="mt-3 font-serif text-5xl">{total}</dd></div>)}</dl>
    <section className="mt-10" aria-labelledby="recent-artworks-title"><div className="flex flex-wrap items-center justify-between gap-4"><h2 id="recent-artworks-title" className="font-serif text-2xl">Karya terbarumu</h2><Link href="/dashboard/member/artworks" className="text-sm font-semibold text-[var(--ink)] underline underline-offset-4">Lihat semua karya</Link></div>{artworks.length ? <div className="mt-6 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}</div> : <p className="mt-5 border border-dashed border-[var(--line)] p-6 text-sm leading-7 text-[var(--muted)]">Portofoliomu masih kosong. Mulai dengan membagikan karya pertamamu.</p>}</section>
    <section className="mt-12 grid gap-x-8 gap-y-3 sm:grid-cols-3" aria-label="Pengaturan Member"><Link href="/dashboard/member/favorites" className="border-t border-[var(--line)] py-5 text-[var(--ink)] hover:border-[var(--ink)]"><h2 className="font-serif text-2xl">Favorit saya</h2><p className="mt-3 text-sm leading-7 text-[var(--muted)]">Kunjungi kembali karya yang menginspirasimu.</p></Link><Link href="/dashboard/member/submissions" className="border-t border-[var(--line)] py-5 text-[var(--ink)] hover:border-[var(--ink)]"><h2 className="font-serif text-2xl">Submisi saya</h2><p className="mt-3 text-sm leading-7 text-[var(--muted)]">Pantau challenge yang kamu ikuti dan hasil penilaiannya.</p></Link><Link href="/dashboard/member/profile" className="border-t border-[var(--line)] py-5 text-[var(--ink)] hover:border-[var(--ink)]"><h2 className="font-serif text-2xl">Profil publik</h2><p className="mt-3 text-sm leading-7 text-[var(--muted)]">Perbarui foto, bio, dan tautan portofoliomu.</p></Link></section>
    <div className="mt-8 panel p-6"><h2 className="font-semibold">Informasi akun</h2><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-[var(--muted)]">Email privat</dt><dd className="mt-1 break-all">{user.email}</dd></div><div><dt className="text-[var(--muted)]">Peran</dt><dd className="mt-1">Member</dd></div></dl><Link href="/dashboard/member/account" className="mt-5 inline-block text-sm font-semibold text-[var(--ink)] underline underline-offset-4">Pengaturan akun privat</Link></div>
  </>;
}

