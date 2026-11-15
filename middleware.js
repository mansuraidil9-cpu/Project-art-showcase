import { NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "./lib/session-token.js";

export async function middleware(request) {
  try {
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (!session) return NextResponse.redirect(new URL("/login", request.url));
    // Halaman server memeriksa sesi aktif, role, dan status Curator melalui database.
    return NextResponse.next();
  } catch (error) {
    console.error("Pemeriksaan akses gagal:", error.code || "AUTH_CONFIG");
    return new NextResponse('<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Akses belum tersedia | Ruang Karya</title><body style="margin:0;background:#f7f5f0;color:#272620;font-family:Arial,sans-serif"><main style="max-width:36rem;padding:4rem 1.5rem;margin:auto"><p>503</p><h1>Akses belum dapat diperiksa.</h1><p style="line-height:1.7">Coba kembali beberapa saat lagi atau muat ulang halaman.</p><a href="/" style="color:#82412e">Kembali ke beranda</a></main></body></html>', {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/curator-status"],
};

