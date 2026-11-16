"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { roleNames } from "@/lib/format";

export default function DashboardNav({ role }) {
  const pathname = usePathname();
  const root = "/dashboard/" + role;
  const items = role === "admin" ? [
    [root, "Ringkasan"],
    [root + "/categories", "Kategori"],
    [root + "/users", "Pengguna"],
    [root + "/curators", "Verifikasi Curator"],
  ] : role === "member" ? [[root, "Ringkasan"], [root + "/artworks", "Karya Saya"], [root + "/artworks/new", "Unggah Karya"], [root + "/profile", "Profil Publik"], [root + "/account", "Akun Privat"]] : [[root, "Dashboard " + roleNames[role]]];
  return <nav aria-label={"Menu " + roleNames[role]} className="flex flex-wrap gap-2 border-b border-stone-300 py-5">
    {items.map(([href, label]) => {
      const selected = href === root ? pathname === root : href.endsWith("/artworks")
        ? pathname === href || (pathname.startsWith(href + "/") && !pathname.startsWith(href + "/new"))
        : pathname === href || pathname.startsWith(href + "/");
      return <Link key={href} href={href} aria-current={selected ? "page" : undefined} className={"rounded-lg border px-4 py-2.5 text-sm font-semibold " + (selected ? "border-orange-800 bg-orange-50 text-orange-900" : "border-stone-300 text-stone-700 hover:text-orange-900")}>{label}</Link>;
    })}
  </nav>;
}

