import { requireUser } from "@/lib/auth";
import Link from "next/link";

export const metadata = { title: "Dashboard Member | Ruang Karya" };
export default async function MemberDashboard() {
  const user = await requireUser({ roles: ["member"] });
  return <>
    <p className="text-xs font-semibold tracking-widest text-orange-800">MEMBER</p><h1 className="mt-3 font-serif text-4xl">Halo, {user.display_name}.</h1>
    <p className="mt-4 max-w-2xl leading-7 text-stone-600">Bagikan karya terbaru dan rawat portofolio yang mewakili sudut pandangmu.</p>
    <div className="mt-7 flex flex-wrap gap-4"><Link href="/dashboard/member/artworks" className="rounded-lg bg-stone-800 px-5 py-3 text-sm font-semibold text-white hover:text-white">Kelola karya</Link><Link href={"/creators/" + user.id} className="rounded-lg border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-800">Lihat profil publik</Link></div>
    <div className="mt-8 rounded-xl border border-stone-300 bg-white p-6"><h2 className="font-semibold">Informasi akun</h2><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-stone-500">Email privat</dt><dd className="mt-1 break-all">{user.email}</dd></div><div><dt className="text-stone-500">Peran</dt><dd className="mt-1">Member</dd></div></dl></div>
  </>;
}

