"use client";

import useActionForm from "@/components/use-action-form";
import { dismissReportAction, takeDownArtworkAction } from "@/app/actions/admin";

function Message({ state }) { return state.message && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-900">{state.message}</p>; }

export function DismissReportForm({ reportId }) {
  const [state, action, pending] = useActionForm(dismissReportAction);
  return <form action={action} className="mt-5 space-y-3" aria-busy={pending}><input type="hidden" name="reportId" value={reportId} /><Message state={state} /><button disabled={pending} className="rounded-lg border border-stone-400 px-4 py-2.5 text-sm font-semibold text-stone-800 disabled:opacity-60">{pending ? "Memproses..." : "Abaikan laporan"}</button></form>;
}

export function TakeDownArtworkForm({ artworkId, title }) {
  const [state, action, pending] = useActionForm(takeDownArtworkAction);
  return <details className="mt-7 text-sm"><summary className="w-fit cursor-pointer font-semibold text-red-900">Hapus karya</summary><form action={action} className="mt-4 space-y-4 rounded-lg border border-red-200 bg-red-50 p-5" aria-busy={pending}>
    <input type="hidden" name="artworkId" value={artworkId} /><Message state={state} />
    <p className="leading-7 text-red-900">Karya beserta komentar, suka, favorit, laporan, dan submisi terkait akan dihapus permanen. Gunakan tindakan ini setelah memeriksa laporan.</p>
    <label className="flex items-start gap-3 leading-6 text-stone-800"><input type="checkbox" name="confirmation" value="yes" required className="mt-1 shrink-0 accent-red-900" /><span className="min-w-0 break-words">Saya sudah meninjau laporan dan ingin menghapus <strong>{title}</strong>.</span></label>
    <button disabled={pending} className="rounded-lg bg-red-900 px-5 py-3 font-semibold text-white disabled:opacity-60">{pending ? "Menghapus..." : "Konfirmasi hapus karya"}</button>
  </form></details>;
}
