import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { userDestination } from "@/lib/session";
import { logoutAction } from "@/app/actions/auth";
import { roleNames } from "@/lib/format";

export default async function AuthLinks({ user: suppliedUser } = {}) {
  const user = suppliedUser === undefined ? await getCurrentUser() : suppliedUser;
  const destinationLabel = user?.role === "curator" && user.curator_status !== "approved" ? "Status Curator" : "Dashboard " + roleNames[user?.role];
  return <nav aria-label="Navigasi akun" className="account-navigation">
    {user ? <>
      <Link href={userDestination(user)} aria-label={destinationLabel} className="button-secondary">{user.role === "curator" && user.curator_status !== "approved" ? "Status Curator" : <>Dashboard<span className="hidden xl:inline">{roleNames[user.role]}</span></>}</Link>
      <form action={logoutAction}><button className="text-link py-2">Keluar</button></form>
    </> : <>
      <Link href="/login" className="button-secondary">Masuk</Link>
      <Link href="/register" className="button-primary">Daftar</Link>
    </>}
  </nav>;
}

