import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { ProfileForm } from "@/components/profile-forms";

export const metadata = { title: "Kelola Profil | Ruang Karya" };
export default async function ProfilePage({ searchParams }) {
  const user = await requireUser({ roles: ["member"] });
  const profile = (await query("profileOwn", [user.id])).rows[0];
  const notice = (await searchParams).notice;
  return <div className="max-w-2xl"><h1 className="font-serif text-4xl">Profil publik</h1><p className="mt-4 leading-7 text-stone-600">Nama, foto, bio, dan tautan ini dapat dilihat pengunjung pada portofoliomu.</p><Link href={"/creators/" + user.id} className="mt-4 inline-block text-sm font-semibold text-stone-800 underline underline-offset-4">Lihat profil publik</Link>
    {["updated", "updated-files"].includes(notice) && <p role="status" className="mt-6 rounded-lg bg-stone-200 p-4 text-sm leading-6">Profil berhasil diperbarui.{notice === "updated-files" && " Foto lama belum dapat dibersihkan dari penyimpanan."}</p>}
    <div className="mt-8 rounded-xl border border-stone-300 bg-white p-5 sm:p-7"><ProfileForm profile={profile} /></div></div>;
}
