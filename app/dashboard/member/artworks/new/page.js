import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { ArtworkForm } from "@/components/artwork-form";

export const metadata = { title: "Unggah Karya | Ruang Karya" };
export default async function NewArtworkPage() {
  await requireUser({ roles: ["member"] });
  const categories = (await query("artworkCategories")).rows;
  return <section className="max-w-2xl"><Link href="/dashboard/member/artworks" className="text-sm text-stone-700 underline underline-offset-4">Kembali ke karya saya</Link><h1 className="mt-6 font-serif text-4xl">Bagikan sudut pandangmu.</h1><p className="mt-4 leading-7 text-stone-600">Lengkapi cerita dan kategori karya, lalu pilih gambar yang ingin ditampilkan.</p>
    {!categories.length && <p role="status" className="mt-6 rounded-lg bg-stone-200 p-4 text-sm leading-6">Kategori belum tersedia. Hubungi Admin sebelum mengunggah karya.</p>}
    <div className="mt-8 rounded-xl border border-stone-300 bg-white p-5 sm:p-7"><ArtworkForm categories={categories} /></div>
  </section>;
}

