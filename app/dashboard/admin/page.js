import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session-token";
import { getAdminStatistics } from "@/lib/admin";

export const metadata = { title: "Dashboard Admin | Ruang Karya" };
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
    <p className="text-xs font-semibold tracking-widest text-orange-800">ADMIN</p><h1 className="mt-3 font-serif text-4xl">Selamat datang, {user.display_name}.</h1>
    <p className="mt-4 max-w-2xl leading-7 text-stone-600">Rawat ruang kreatif ini melalui pengelolaan kategori, komunitas, dan laporan karya.</p>
    <section className="mt-8" aria-labelledby="statistics-title"><h2 id="statistics-title" className="font-serif text-2xl">Sekilas platform</h2><p className="mt-3 text-sm leading-7 text-stone-600">Jumlah akun per peran dan aktivitas platform saat halaman dibuka.</p><dl aria-label="Statistik platform" className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{totals.map(([label, total]) => <div key={label} className="min-w-0 rounded-xl border border-stone-300 bg-white p-5"><dt className="text-sm text-stone-600">{label}</dt><dd className="mt-3 text-3xl font-semibold">{total}</dd></div>)}</dl></section>
    <div className="mt-8 grid gap-5 md:grid-cols-2">{modules.map(([path, title, description]) => <section key={path} className="rounded-xl border border-stone-300 bg-white p-6"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-7 text-stone-600">{description}</p><Link href={"/dashboard/admin/" + path} className="mt-6 inline-block text-sm font-semibold text-orange-900 underline underline-offset-4">Buka {title.toLowerCase()}</Link></section>)}</div>
  </>;
}

