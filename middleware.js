import { NextResponse } from "next/server";
import { getSessionUser, SESSION_COOKIE, userDestination } from "./lib/session.js";

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  try {
    const user = await getSessionUser(request.cookies.get(SESSION_COOKIE)?.value);
    if (path === "/login" || path === "/register") {
      return user ? NextResponse.redirect(new URL(userDestination(user), request.url)) : NextResponse.next();
    }
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
    const destination = userDestination(user);
    if (path === "/curator-status") {
      return destination === path ? NextResponse.next() : NextResponse.redirect(new URL(destination, request.url));
    }
    const allowedRoot = "/dashboard/" + user.role;
    if (destination === "/curator-status" || (path !== allowedRoot && !path.startsWith(allowedRoot + "/"))) {
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  } catch (error) {
    console.error("Pemeriksaan akses gagal:", error.code || "AUTH_CONFIG");
    return new NextResponse('<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Akses belum tersedia | Ruang Karya</title><body style="margin:0;background:#f7f5f0;color:#272620;font-family:Arial,sans-serif"><main style="max-width:36rem;padding:4rem 1.5rem;margin:auto"><p>503</p><h1>Akses belum dapat diperiksa.</h1><p style="line-height:1.7">Periksa koneksi database dan konfigurasi sesi, lalu muat ulang halaman.</p><a href="/" style="color:#82412e">Kembali ke beranda</a></main></body></html>', {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}

export const config = {
  runtime: "nodejs",
  matcher: ["/dashboard/:path*", "/curator-status", "/login", "/register"],
};

