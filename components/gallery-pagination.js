import Link from "next/link";

export default function GalleryPagination({ gallery, pathname = "/", filters = {}, anchor = "", label = "Halaman galeri" }) {
  if (gallery.pages <= 1) return null;
  function url(page) {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.categoryId) params.set("category", String(filters.categoryId));
    if (filters.sort) params.set("sort", filters.sort);
    params.set("page", String(page));
    return pathname + "?" + params.toString() + anchor;
  }
  return <nav aria-label={label} className="mt-10 flex flex-wrap items-center gap-5 text-sm">
    {gallery.page > 1 && <Link href={url(gallery.page - 1)} className="font-semibold text-stone-800 underline">Sebelumnya</Link>}
    <span className="text-stone-600">Halaman {gallery.page} dari {gallery.pages}</span>
    {gallery.page < gallery.pages && <Link href={url(gallery.page + 1)} className="font-semibold text-stone-800 underline">Berikutnya</Link>}
  </nav>;
}

