import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatDate, roleNames, statusNames } from "@/lib/format";
import { DeleteUserForm } from "@/components/admin/forms";

export const metadata = { title: "Pengguna | Admin Atelier" };
const pageSize = 12;
export default async function UsersPage({ searchParams }) {
  const actor = await requireUser({ roles: ["admin"] });
  const params = await searchParams;
  const role = typeof params.role === "string" ? params.role : "";
  const validRole = ["", "admin", "member", "curator"].includes(role);
  const count = validRole ? (await query("adminUsersCount", [role])).rows[0].total : 0;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const requested = Number(params.page);
  const page = Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, totalPages) : 1;
  const users = validRole ? (await query("adminUsersList", [role, pageSize, (page - 1) * pageSize])).rows : [];
  const message = new Map([["deleted", "Pengguna dan data terkait berhasil dihapus."], ["deleted-files", "Akun dihapus, namun sebagian berkas belum dapat dibersihkan."]]).get(params.notice);
  const pageUrl = (number) => "/dashboard/admin/users?" + new URLSearchParams({ role, page: String(number) });
  return <>
    <p className="eyebrow">ADMIN / PENGGUNA</p>
    <h1 className="mt-3 page-heading">Kenali komunitasnya.</h1>
    <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">Lihat akun berdasarkan peran. Akun Admin dilindungi dari penghapusan.</p>
    {message && <p role="status" className="mt-6 bg-[#e6e2d5] p-4 text-sm leading-6">{message}</p>}
    <form method="get" action="/dashboard/admin/users" className="mt-7 flex flex-wrap items-end gap-3">
      <div><label htmlFor="role-filter" className="block text-sm font-semibold">Filter peran</label><select id="role-filter" name="role" defaultValue={validRole ? role : ""} className="mt-2 border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-[var(--ink)]"><option value="">Semua peran</option>{Object.entries(roleNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <button className="button-primary">Terapkan</button>
      <Link href="/dashboard/admin/users" className="px-2 py-2.5 text-sm text-[var(--ink)] underline underline-offset-4">Reset filter</Link>
    </form>
    {!validRole ? <p role="alert" className="mt-7 bg-red-50 p-5 text-sm text-red-900">Filter peran tidak dikenali. Pilih peran yang tersedia atau reset filter.</p> : <>
      <p className="mt-6 text-sm text-[var(--muted)]">{count} akun ditemukan</p>
      {!users.length ? <p className="mt-5 border border-dashed border-[var(--line)] p-7 text-[var(--muted)]">Belum ada pengguna dengan peran ini.</p> : <div className="mt-5 grid gap-5 md:grid-cols-2">
        {users.map((user) => <article key={user.id} className="min-w-0 panel p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3"><h2 className="min-w-0 max-w-full break-words text-lg font-semibold">{user.display_name}</h2><span className="bg-[#e9e6db] px-3 py-1 text-xs font-semibold">{roleNames[user.role]}</span></div>
          <p className="mt-3 break-all text-sm text-[var(--muted)]">{user.email}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">Bergabung {formatDate(user.created_at)} WITA</p>
          {user.role === "curator" && <p className="mt-3 text-sm text-[var(--ink)]">Status Curator: <strong>{statusNames[user.curator_status]}</strong></p>}
          {user.role === "admin" ? <p className="mt-5 text-xs leading-6 text-[var(--muted)]">{user.id === actor.id ? "Ini akunmu. Akun Admin dilindungi." : "Akun Admin dilindungi."}</p> : <DeleteUserForm user={user} returnRole={role} />}
        </article>)}
      </div>}
      {totalPages > 1 && <nav aria-label="Halaman daftar pengguna" className="mt-8 flex flex-wrap items-center gap-5 text-sm">
        {page > 1 && <Link href={pageUrl(page - 1)} className="font-semibold text-[var(--ink)] underline">Sebelumnya</Link>}
        <span className="text-[var(--muted)]">Halaman {page} dari {totalPages}</span>
        {page < totalPages && <Link href={pageUrl(page + 1)} className="font-semibold text-[var(--ink)] underline">Berikutnya</Link>}
      </nav>}
    </>}
  </>;
}

