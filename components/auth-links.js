import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { userDestination } from "@/lib/session";
import { logoutAction } from "@/app/actions/auth";

export default async function AuthLinks() {
  const user = await getCurrentUser();
  return <nav aria-label="Akun" className="flex flex-wrap items-center gap-5 text-sm">
    {user ? <>
      <Link href={userDestination(user)} className="font-semibold text-stone-800">{user.role === "curator" && user.curator_status !== "approved" ? "Status akun" : "Dashboard"}</Link>
      <form action={logoutAction}><button className="text-stone-600 underline underline-offset-4">Keluar</button></form>
    </> : <>
      <Link href="/login" className="font-semibold text-stone-800">Masuk</Link>
      <Link href="/register" className="rounded-lg border border-stone-300 px-4 py-2 font-semibold text-stone-800">Daftar</Link>
    </>}
  </nav>;
}

