"use client";

import useActionForm from "@/components/use-action-form";
import { saveCategoryAction, deleteCategoryAction, deleteUserAction, verifyCuratorAction } from "@/app/actions/admin";

const inputClass = "mt-2 field-input text-sm";
const buttonClass = "button-primary disabled:cursor-not-allowed disabled:opacity-60";


function Message({ state }) {
  if (!state.message) return null;
  return <p role={state.success ? "status" : "alert"} className={"p-3 text-sm leading-6 " + (state.success ? "bg-stone-100 text-stone-800" : "bg-red-50 text-red-900")}>{state.message}</p>;
}

export function CategoryForm({ category }) {
  const [state, action, pending] = useActionForm(saveCategoryAction);
  const values = Object.keys(state.values).length ? state.values : category || {};
  return <form action={action} className="space-y-5" aria-busy={pending}>
    <input type="hidden" name="id" value={category?.id || ""} />
    <Message state={state} />
    <div>
      <label htmlFor="category-name" className="block text-sm font-semibold">Nama kategori</label>
      <input id="category-name" name="name" required maxLength={60} defaultValue={values.name || ""} className={inputClass} aria-invalid={Boolean(state.fields.name)} aria-describedby={state.fields.name ? "category-name-error" : "category-name-help"} />
      <p id="category-name-help" className="mt-2 text-xs leading-5 text-stone-600">Wajib diisi dan unik, termasuk jika hanya berbeda huruf besar/kecil.</p>
      {state.fields.name && <p id="category-name-error" className="mt-2 text-sm text-red-800">{state.fields.name}</p>}
    </div>
    <div>
      <label htmlFor="category-description" className="block text-sm font-semibold">Deskripsi singkat <span className="font-normal text-stone-600">(opsional)</span></label>
      <textarea id="category-description" name="description" rows={3} maxLength={250} defaultValue={values.description || ""} className={inputClass} aria-invalid={Boolean(state.fields.description)} aria-describedby={state.fields.description ? "category-description-error" : undefined} />
      {state.fields.description && <p id="category-description-error" className="mt-2 text-sm text-red-800">{state.fields.description}</p>}
    </div>
    <button disabled={pending} className={buttonClass}>{pending ? "Menyimpan..." : category ? "Simpan perubahan" : "Tambah kategori"}</button>
  </form>;
}

export function DeleteCategoryForm({ id, name, artworkCount }) {
  const [state, action, pending] = useActionForm(deleteCategoryAction);
  if (artworkCount > 0) return <p className="text-xs leading-5 text-stone-600">Penghapusan tersedia setelah karya dipindahkan ke kategori lain.</p>;
  return <details className="text-sm">
    <summary className="w-fit cursor-pointer font-semibold text-red-900">Hapus kategori</summary>
    <form action={action} className="mt-4 space-y-4 border border-red-200 p-4" aria-busy={pending}>
      <input type="hidden" name="id" value={id} />
      <Message state={state} />
      <label className="flex items-start gap-3"><input type="checkbox" name="confirmation" value="yes" required className="mt-1 accent-stone-800" /><span>Saya ingin menghapus kategori <strong>{name}</strong> secara permanen.</span></label>
      <button disabled={pending} className="bg-red-900 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{pending ? "Menghapus..." : "Konfirmasi hapus kategori"}</button>
    </form>
  </details>;
}

export function DeleteUserForm({ user, returnRole }) {
  const [state, action, pending] = useActionForm(deleteUserAction);
  const fieldId = "delete-user-" + user.id;
  return <details className="mt-5 text-sm">
    <summary className="w-fit cursor-pointer font-semibold text-red-900">Hapus pengguna</summary>
    <form action={action} className="mt-4 space-y-4 border border-red-200 p-4" aria-busy={pending}>
      <input type="hidden" name="id" value={user.id} />
      <input type="hidden" name="returnRole" value={returnRole} />
      <Message state={state} />
      <p className="leading-6 text-stone-600">Penghapusan permanen akan menghapus akun beserta karya, challenge, interaksi, submisi, dan sesi terkait miliknya.</p>
      <div><label htmlFor={fieldId} className="block break-all font-semibold">Ketik email akun: {user.email}</label><input id={fieldId} name="confirmationEmail" type="email" required autoComplete="off" className={inputClass} /></div>
      <button disabled={pending} className="bg-red-900 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{pending ? "Menghapus..." : "Konfirmasi hapus pengguna"}</button>
    </form>
  </details>;
}

export function CuratorDecisionForm({ id, decision }) {
  const [state, action, pending] = useActionForm(verifyCuratorAction);
  const rejected = decision === "rejected";
  const form = <form action={action} className="space-y-4" aria-busy={pending}>
    <input type="hidden" name="id" value={id} /><input type="hidden" name="decision" value={decision} />
    <Message state={state} />
    {rejected && <div>
      <label htmlFor={"reject-" + id} className="block text-sm font-semibold">Alasan penolakan</label>
      <textarea id={"reject-" + id} name="reason" required minLength={5} maxLength={500} rows={3} defaultValue={state.values.reason || ""} className={inputClass} aria-invalid={Boolean(state.fields.reason)} aria-describedby={"reject-help-" + id} />
      <p id={"reject-help-" + id} className="mt-2 text-xs leading-5 text-stone-600">Tulis 5–500 karakter. Alasan ini akan ditampilkan kepada Curator.</p>
      {state.fields.reason && <p className="mt-2 text-sm text-red-800">{state.fields.reason}</p>}
    </div>}
    <button disabled={pending} className={rejected ? "bg-red-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60" : buttonClass}>{pending ? "Memproses..." : rejected ? "Konfirmasi tolak" : "Setujui Curator"}</button>
  </form>;
  return rejected ? <details className="border border-[var(--line)] p-4"><summary className="cursor-pointer text-sm font-semibold text-red-900">Tolak pendaftaran</summary><div className="mt-4">{form}</div></details> : form;
}

