import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";

export default async function DashboardLayout({ children }) {
  const user = await requireUser();
  return <div className="mx-auto max-w-5xl px-5 sm:px-9">
    <header className="flex flex-wrap items-center justify-between gap-5 border-b border-stone-300 py-7">
      <Link href="/" className="text-xl font-bold text-stone-800">ruang karya<span className="text-orange-800">.</span></Link>
      <nav aria-label="Navigasi dashboard" className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
        <Link href="/" className="font-semibold text-stone-800 underline underline-offset-4">Beranda</Link>
        <span className="max-w-44 break-words text-stone-600">{user.display_name}</span>
        <form action={logoutAction}><button className="font-semibold text-stone-800 underline underline-offset-4">Keluar</button></form>
      </nav>
    </header>
    <main className="py-12">{children}</main>
  </div>;
}

