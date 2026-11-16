import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { userDestination } from "@/lib/session";
import { logoutAction } from "@/app/actions/auth";
import { roleNames } from "@/lib/format";

export default async function AuthLinks({ user: suppliedUser } = {}) {
  const user = suppliedUser === undefined ? await getCurrentUser() : suppliedUser;
  return <nav aria-label="Navigasi akun" className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
    <Link href="/" className="font-semibold text-stone-800">Beranda</Link>
    <Link href="/challenges" className="font-semibold text-stone-800">Challenge</Link>
    {user ? <>
      <Link href={userDestination(user)} className="font-semibold text-stone-800">{user.role === "curator" && user.curator_status !== "approved" ? "Status Curator" : "Dashboard " + roleNames[user.role]}</Link>
      <span className="max-w-40 break-words text-stone-600">{user.display_name}</span>
      <form action={logoutAction}><button className="text-stone-600 underline underline-offset-4">Keluar</button></form>
    </> : <>
      <Link href="/login" className="font-semibold text-stone-800">Masuk</Link>
      <Link href="/register" className="rounded-lg border border-stone-300 px-4 py-2 font-semibold text-stone-800">Daftar</Link>
    </>}
  </nav>;
}

