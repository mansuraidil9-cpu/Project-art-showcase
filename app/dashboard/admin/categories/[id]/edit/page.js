import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { positiveId } from "@/lib/admin";
import { CategoryForm } from "@/components/admin/forms";

export const metadata = { title: "Edit Kategori | Admin Atelier" };
export default async function EditCategoryPage({ params }) {
  await requireUser({ roles: ["admin"] });
  const values = await params;
  let id;
  try { id = positiveId(values.id); } catch { notFound(); }
  const category = (await query("categoryFind", [id])).rows[0];
  if (!category) notFound();
  return <section className="max-w-xl">
    <Link href="/dashboard/admin/categories" className="text-sm text-[var(--ink)] underline underline-offset-4">Kembali ke kategori</Link>
    <h1 className="mt-6 page-heading">Edit kategori.</h1>
    <div className="mt-7 panel p-5 sm:p-7"><CategoryForm category={category} /></div>
  </section>;
}

