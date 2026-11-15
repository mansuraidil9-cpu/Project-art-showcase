import { requireUser } from "@/lib/auth";

export const metadata = { title: "Dashboard Admin | Ruang Karya" };
export default async function AdminDashboard() {
  const user = await requireUser({ roles: ["admin"] });
  return <>
    <p className="text-xs font-semibold tracking-widest text-orange-800">ADMIN</p><h1 className="mt-3 font-serif text-4xl">Selamat datang, {user.display_name}.</h1>
    <p className="mt-4 max-w-2xl leading-7 text-stone-600">Akses Admin sudah terlindungi. Manajemen kategori, pengguna, dan verifikasi Curator akan dibuat pada Hari 3.</p>
  </>;
}

