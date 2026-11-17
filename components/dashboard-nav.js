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
    [root + "/moderation", "Moderasi Konten"],
  ] : role === "member" ? [[root, "Ringkasan"], [root + "/artworks", "Karya Saya"], [root + "/artworks/new", "Unggah Karya"], [root + "/favorites", "Favorit Saya"], [root + "/submissions", "Submisi Saya"], [root + "/profile", "Profil Publik"], [root + "/account", "Akun Privat"]] : [[root, "Challenge Saya"], [root + "/challenges/new", "Buat Challenge"]];
  return <nav aria-label={"Menu " + roleNames[role]} className="flex flex-wrap gap-x-6 gap-y-2 border-b border-[var(--line)] py-5 sm:gap-x-8">
    {items.map(([href, label]) => {
      const selected = href === root ? pathname === root || (role === "curator" && pathname.startsWith(root + "/challenges/") && !pathname.endsWith("/new")) : href.endsWith("/artworks")
        ? pathname === href || (pathname.startsWith(href + "/") && !pathname.startsWith(href + "/new"))
        : pathname === href || pathname.startsWith(href + "/");
      return <Link key={href} href={href} aria-current={selected ? "page" : undefined} className={"border-b py-2 text-sm text-[var(--ink)] transition-colors " + (selected ? "border-[var(--ink)] font-semibold" : "border-transparent hover:border-[var(--line)]")}>{label}</Link>;
    })}
  </nav>;
}

