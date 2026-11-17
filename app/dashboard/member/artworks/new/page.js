import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { ArtworkForm } from "@/components/artwork-form";

export const metadata = { title: "Unggah Karya | Atelier" };
export default async function NewArtworkPage() {
  await requireUser({ roles: ["member"] });
  const categories = (await query("artworkCategories")).rows;
  return <section className="max-w-2xl"><Link href="/dashboard/member/artworks" className="text-sm text-[var(--ink)] underline underline-offset-4">Kembali ke karya saya</Link><h1 className="mt-6 page-heading">Bagikan sudut pandangmu.</h1><p className="mt-4 leading-7 text-[var(--muted)]">Lengkapi cerita dan kategori karya, lalu pilih gambar yang ingin ditampilkan.</p>
    {!categories.length && <p role="status" className="mt-6 bg-[#e6e2d5] p-4 text-sm leading-6">Kategori belum tersedia. Hubungi Admin sebelum mengunggah karya.</p>}
    <div className="mt-8 panel p-5 sm:p-7"><ArtworkForm categories={categories} /></div>
  </section>;
}

