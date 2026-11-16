import { requireUser } from "@/lib/auth";
import Link from "next/link";

export const metadata = { title: "Dashboard Admin | Ruang Karya" };
export default async function AdminDashboard() {
  const user = await requireUser({ roles: ["admin"] });
  const modules = [
    ["categories", "Kategori karya", "Atur kategori agar karya mudah ditemukan."],
    ["users", "Pengguna", "Lihat akun komunitas dan kelola Member serta Curator."],
    ["curators", "Verifikasi Curator", "Tinjau pendaftaran penggerak challenge yang baru bergabung."],
  ];
  return <>
    <p className="text-xs font-semibold tracking-widest text-orange-800">ADMIN</p><h1 className="mt-3 font-serif text-4xl">Selamat datang, {user.display_name}.</h1>
    <p className="mt-4 max-w-2xl leading-7 text-stone-600">Rawat ruang kreatif ini melalui pengelolaan kategori dan komunitas.</p>
    <div className="mt-8 grid gap-5 md:grid-cols-3">{modules.map(([path, title, description]) => <section key={path} className="rounded-xl border border-stone-300 bg-white p-6"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-7 text-stone-600">{description}</p><Link href={"/dashboard/admin/" + path} className="mt-6 inline-block text-sm font-semibold text-orange-900 underline underline-offset-4">Buka {title.toLowerCase()}</Link></section>)}</div>
  </>;
}

