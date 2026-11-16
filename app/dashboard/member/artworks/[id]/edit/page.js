import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { parseId } from "@/lib/validation";
import { query } from "@/lib/db";
import { ArtworkForm } from "@/components/artwork-form";

export const metadata = { title: "Edit Karya | Ruang Karya" };
export default async function EditArtworkPage({ params }) {
  const user = await requireUser({ roles: ["member"] });
  const id = parseId((await params).id);
  if (!id) notFound();
  const artwork = (await query("artworkDetail", [id])).rows[0];
  if (!artwork || artwork.member_id !== user.id) notFound();
  const categories = (await query("artworkCategories")).rows;
  return <section className="max-w-2xl"><Link href="/dashboard/member/artworks" className="text-sm text-stone-700 underline underline-offset-4">Kembali ke karya saya</Link><h1 className="mt-6 font-serif text-4xl">Perbarui cerita karyamu.</h1><p className="mt-4 leading-7 text-stone-600">Ubah judul, deskripsi, kategori, dan tags. File karya tetap menggunakan gambar semula.</p><div className="mt-8 rounded-xl border border-stone-300 bg-white p-5 sm:p-7"><ArtworkForm categories={categories} artwork={{ id, title: artwork.title, description: artwork.description, category_id: artwork.category_id, tags: artwork.tags, file_path: artwork.file_path }} /></div></section>;
}

