"use client";
import { useActionState } from "react";
import { deleteRejectedAccountAction } from "@/app/actions/auth";

export default function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteRejectedAccountAction, { message: "" });
  return (
    <section className="mt-8 rounded-xl border border-red-200 bg-white p-6" aria-labelledby="delete-title">
      <h2 id="delete-title" className="text-lg font-semibold text-red-900">Hapus akun</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">Penghapusan bersifat permanen. Akun dan seluruh sesinya akan dihapus. Kamu dapat mendaftar kembali setelahnya.</p>
      <form action={action} className="mt-5 space-y-4" aria-busy={pending}>
        {state.message && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-900">{state.message}</p>}
        <div><label htmlFor="delete-password" className="block text-sm font-semibold">Password akun</label><input id="delete-password" name="password" type="password" autoComplete="current-password" required maxLength={72} className="mt-2 w-full rounded-lg border border-stone-300 px-4 py-3" /></div>
        <div><label htmlFor="delete-confirmation" className="block text-sm font-semibold">Ketik HAPUS untuk konfirmasi</label><input id="delete-confirmation" name="confirmation" required autoComplete="off" className="mt-2 w-full rounded-lg border border-stone-300 px-4 py-3" /></div>
        <button disabled={pending} className="rounded-lg bg-red-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">{pending ? "Menghapus..." : "Hapus akun permanen"}</button>
      </form>
    </section>
  );
}

