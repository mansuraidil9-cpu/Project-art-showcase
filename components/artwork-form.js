"use client";

import Image from "next/image";
import { startTransition, useEffect, useState } from "react";
import useActionForm from "@/components/use-action-form";
import { saveArtworkAction, deleteArtworkAction } from "@/app/actions/artworks";
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/artwork-rules";

const inputClass = "mt-2 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-800";

export function ArtworkForm({ categories, artwork }) {
  const [selectedFile, setSelectedFile] = useState(null);
  async function submitArtwork(previous, form) {
    if (!artwork && selectedFile) form.set("file", selectedFile);
    return saveArtworkAction(previous, form);
  }
  const [state, action, pending] = useActionForm(submitArtwork);
  const [preview, setPreview] = useState(null);
  const [fileError, setFileError] = useState("");
  const values = Object.keys(state.values).length ? state.values : {
    title: artwork?.title || "", description: artwork?.description || "",
    categoryId: String(artwork?.category_id || ""), tags: artwork?.tags.join(", ") || "",
  };
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function chooseFile(event) {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    let error = "";
    if (file && !IMAGE_TYPES.includes(file.type)) error = "Gunakan JPEG, PNG, atau WebP.";
    if (file && file.size > MAX_IMAGE_BYTES) error = "Ukuran gambar maksimal 5 MB.";
    setFileError(error);
    setPreview(file && !error ? URL.createObjectURL(file) : null);
  }

  function submitForm(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(() => action(form));
  }

  return <form method="post" onSubmit={submitForm} className="space-y-6" aria-busy={pending}>
    <input type="hidden" name="id" value={artwork?.id || ""} />
    {state.message && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm leading-6 text-red-900">{state.message}</p>}
    <div><label htmlFor="art-title" className="block text-sm font-semibold">Judul karya</label>
      <input id="art-title" name="title" required maxLength={150} defaultValue={values.title} className={inputClass} aria-invalid={Boolean(state.fields.title)} aria-describedby={state.fields.title ? "art-title-error" : undefined} />
      {state.fields.title && <p id="art-title-error" className="mt-2 text-sm text-red-800">{state.fields.title}</p>}
    </div>
    <div><label htmlFor="art-description" className="block text-sm font-semibold">Deskripsi karya</label>
      <textarea id="art-description" name="description" rows={5} required maxLength={5000} defaultValue={values.description} className={inputClass} aria-invalid={Boolean(state.fields.description)} aria-describedby={state.fields.description ? "art-description-error" : undefined} />
      {state.fields.description && <p id="art-description-error" className="mt-2 text-sm text-red-800">{state.fields.description}</p>}
    </div>
    <div><label htmlFor="art-category" className="block text-sm font-semibold">Kategori</label>
      <select id="art-category" name="categoryId" required defaultValue={values.categoryId} className={inputClass} aria-invalid={Boolean(state.fields.categoryId)} aria-describedby={state.fields.categoryId ? "art-category-error" : undefined}>
        <option value="">Pilih kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
      {state.fields.categoryId && <p id="art-category-error" className="mt-2 text-sm text-red-800">{state.fields.categoryId}</p>}
    </div>
    <div><label htmlFor="art-tags" className="block text-sm font-semibold">Tags</label>
      <input id="art-tags" name="tags" required maxLength={500} defaultValue={values.tags} placeholder="ilustrasi, makassar, alam" className={inputClass} aria-invalid={Boolean(state.fields.tags)} aria-describedby="art-tags-help" />
      <p id="art-tags-help" className="mt-2 text-xs leading-6 text-stone-600">Pisahkan dengan koma. Isi 1–10 tag, maksimal 40 karakter per tag. Tag yang sama akan digabung.</p>
      {state.fields.tags && <p className="mt-2 text-sm text-red-800">{state.fields.tags}</p>}
    </div>
    {artwork ? <section aria-label="File karya tetap" className="rounded-xl border border-stone-300 bg-stone-50 p-5">
      <h2 className="text-sm font-semibold">File karya tetap</h2>
      <Image src={artwork.file_path} alt={artwork.title} width={800} height={600} unoptimized className="mt-4 max-h-80 w-full object-contain" />
      <p className="mt-4 text-sm leading-6 text-stone-600">File tidak bisa diganti saat edit. Untuk mengganti gambar, hapus karya lalu unggah ulang.</p>
      {state.fields.file && <p className="mt-2 text-sm text-red-800">{state.fields.file}</p>}
    </section> : <div>
      <label htmlFor="art-file" className="block text-sm font-semibold">Gambar karya</label>
      <div className="mt-3 rounded-lg border border-stone-300 bg-white p-3">
        <input id="art-file" name="file" type="file" required={!selectedFile} disabled={pending} accept="image/jpeg,image/png,image/webp" onChange={chooseFile} className="peer sr-only" aria-label="Gambar karya" aria-describedby="art-file-help" aria-invalid={Boolean(fileError || state.fields.file)} />
        <label htmlFor="art-file" className="inline-block cursor-pointer rounded-md bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-800 peer-focus-visible:outline-2 peer-focus-visible:outline-orange-800">{selectedFile ? "Ganti gambar" : "Pilih gambar"}</label>
        <p className="mt-3 break-all text-xs leading-6 text-stone-600">{selectedFile?.name || "Belum ada gambar dipilih."}</p>
      </div>
      <p id="art-file-help" className="mt-2 text-xs leading-6 text-stone-600">JPEG, PNG, atau WebP. Maksimal 5 MB dan 20 megapiksel. Gambar disimpan sebagai WebP.</p>
      {(fileError || state.fields.file) && <p role="alert" className="mt-2 text-sm text-red-800">{fileError || state.fields.file}</p>}
      {preview && <figure className="mt-4 rounded-xl bg-stone-100 p-3"><Image src={preview} alt="Pratinjau gambar yang dipilih" width={800} height={600} unoptimized className="max-h-80 w-full object-contain" /><figcaption className="mt-3 break-all text-xs text-stone-600">{selectedFile?.name}</figcaption></figure>}
    </div>}
    <button disabled={pending || Boolean(fileError) || !categories.length} className="rounded-lg bg-stone-800 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Menyimpan..." : artwork ? "Simpan perubahan" : "Unggah karya"}</button>
  </form>;
}

export function DeleteArtworkForm({ id, title }) {
  const [state, action, pending] = useActionForm(deleteArtworkAction);
  return <details className="text-sm"><summary className="w-fit cursor-pointer font-semibold text-red-900">Hapus karya</summary>
    <form action={action} className="mt-4 space-y-4 rounded-lg border border-red-200 bg-white p-4" aria-busy={pending}>
      <input type="hidden" name="id" value={id} />
      {state.message && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-900">{state.message}</p>}
      <p className="leading-6 text-stone-600">Karya, komentar, dan keterkaitan submisinya akan dihapus secara permanen.</p>
      <label className="flex items-start gap-3"><input type="checkbox" name="confirmation" value="yes" required className="mt-1 shrink-0 accent-stone-800" /><span className="min-w-0 break-words">Saya ingin menghapus <strong>{title}</strong>.</span></label>
      <button disabled={pending} className="rounded-lg bg-red-900 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{pending ? "Menghapus..." : "Konfirmasi hapus karya"}</button>
    </form>
  </details>;
}

