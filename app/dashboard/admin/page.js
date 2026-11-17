import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session-token";
import { getAdminStatistics } from "@/lib/admin";

export const metadata = { title: "Dashboard Admin | Atelier" };
export default async function AdminDashboard() {
  const user = await requireUser({ roles: ["admin"] });
  const statistics = await getAdminStatistics((await cookies()).get(SESSION_COOKIE)?.value);
  const totals = [["Admin", statistics.admins], ["Member", statistics.members], ["Curator", statistics.curators], ["Karya", statistics.artworks], ["Laporan belum diproses", statistics.pending_reports], ["Challenge aktif", statistics.active_challenges]];
  const modules = [
    ["categories", "Kategori karya", "Atur kategori agar karya mudah ditemukan."],
    ["users", "Pengguna", "Lihat akun komunitas dan kelola Member serta Curator."],
    ["curators", "Verifikasi Curator", "Tinjau pendaftaran penggerak challenge yang baru bergabung."],
    ["moderation", "Moderasi konten", "Periksa laporan komunitas dan tentukan tindakan terhadap karya."],
  ];
  return <>
    <p className="eyebrow">ADMIN</p><h1 className="mt-3 break-words page-heading">Selamat datang, {user.display_name}.</h1>
    <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">Rawat ruang kreatif ini melalui pengelolaan kategori, komunitas, dan laporan karya.</p>
    <section className="mt-12" aria-labelledby="statistics-title"><h2 id="statistics-title" className="font-serif text-3xl">Sekilas platform</h2><p className="mt-3 text-sm leading-7 text-[var(--muted)]">Jumlah akun per peran dan aktivitas platform saat halaman dibuka.</p><dl aria-label="Statistik platform" className="mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">{totals.map(([label, total]) => <div key={label} className="min-w-0 border-t border-[var(--line)] py-5"><dt className="text-sm text-[var(--muted)]">{label}</dt><dd className="mt-3 font-serif text-5xl">{total}</dd></div>)}</dl></section>
    <div className="mt-10 grid gap-x-10 gap-y-3 md:grid-cols-2">{modules.map(([path, title, description]) => <section key={path} className="border-t border-[var(--line)] py-6"><h2 className="font-serif text-3xl">{title}</h2><p className="mt-3 text-sm leading-7 text-[var(--muted)]">{description}</p><Link href={"/dashboard/admin/" + path} className="mt-6 inline-block text-sm font-semibold text-[var(--ink)] underline underline-offset-4">Buka {title.toLowerCase()}</Link></section>)}</div>
  </>;
}

