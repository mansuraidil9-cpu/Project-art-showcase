import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { CategoryForm, DeleteCategoryForm } from "@/components/admin/forms";

export const metadata = { title: "Kategori | Admin Atelier" };
export default async function CategoriesPage({ searchParams }) {
  await requireUser({ roles: ["admin"] });
  const categories = (await query("categoriesList")).rows;
  const { notice } = await searchParams;
  const message = new Map([["created", "Kategori berhasil ditambahkan."], ["updated", "Kategori berhasil diperbarui."], ["deleted", "Kategori berhasil dihapus."]]).get(notice);
  return <>
    <p className="eyebrow">ADMIN / KATEGORI</p>
    <h1 className="mt-3 page-heading">Ruang untuk setiap jenis karya.</h1>
    <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">Kelola kategori yang membantu kreator dan pengunjung menemukan karya.</p>
    {message && <p role="status" className="mt-6 bg-[#e6e2d5] p-4 text-sm">{message}</p>}
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[20rem_1fr]">
      <section aria-labelledby="create-title" className="panel p-5 sm:p-6">
        <h2 id="create-title" className="mb-6 text-xl font-semibold">Tambah kategori</h2>
        <CategoryForm />
      </section>
      <section aria-labelledby="list-title">
        <h2 id="list-title" className="mb-5 text-xl font-semibold">Daftar kategori <span className="font-normal text-[var(--muted)]">({categories.length})</span></h2>
        {!categories.length ? <p className="border border-dashed border-[var(--line)] p-7 leading-7 text-[var(--muted)]">Belum ada kategori. Tambahkan kategori pertama melalui form.</p> : <div className="space-y-4">
          {categories.map((category) => <article key={category.id} className="min-w-0 panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="min-w-0 max-w-full break-words text-lg font-semibold">{category.name}</h3>
              <Link href={"/dashboard/admin/categories/" + category.id + "/edit"} className="text-sm font-semibold text-[var(--ink)] underline underline-offset-4">Edit kategori</Link>
            </div>
            <p className="mt-3 break-words text-sm leading-6 text-[var(--muted)]">{category.description || "Belum ada deskripsi."}</p>
            <p className="mb-4 mt-3 text-xs text-[var(--muted)]">Digunakan oleh {category.artwork_count} karya</p>
            <DeleteCategoryForm id={category.id} name={category.name} artworkCount={category.artwork_count} />
          </article>)}
        </div>}
      </section>
    </div>
  </>;
}

