import { requireUser } from "@/lib/auth";

export const metadata = { title: "Dashboard Curator | Ruang Karya" };
export default async function CuratorDashboard() {
  const user = await requireUser({ roles: ["curator"] });
  return <>
    <p className="text-xs font-semibold tracking-widest text-orange-800">CURATOR TERVERIFIKASI</p><h1 className="mt-3 font-serif text-4xl">Halo, {user.display_name}.</h1>
    <p className="mt-4 max-w-2xl leading-7 text-stone-600">Akunmu sudah disetujui. Pengelolaan challenge dan pemilihan pemenang akan ditambahkan pada Hari 7–8.</p>
  </>;
}

