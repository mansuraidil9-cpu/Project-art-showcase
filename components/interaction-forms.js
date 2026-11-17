"use client";

import useActionForm from "@/components/use-action-form";
import { interactionAction, commentAction, deleteCommentAction, reportAction } from "@/app/actions/member";
import { REPORT_REASONS } from "@/lib/interaction-rules";

const inputClass = "mt-2 field-input text-sm";
function Message({ state }) { return state.message && <p role="alert" className="bg-red-50 p-3 text-sm leading-6 text-red-900">{state.message}</p>; }

export function InteractionButton({ artworkId, kind, active }) {
  const [state, action, pending] = useActionForm(interactionAction);
  const label = kind === "like" ? active ? "Batalkan suka" : "Suka" : active ? "Hapus dari favorit" : "Simpan ke favorit";
  return <form action={action} aria-busy={pending} className="space-y-3">
    <input type="hidden" name="artworkId" value={artworkId} /><input type="hidden" name="kind" value={kind} /><input type="hidden" name="enabled" value={active ? "no" : "yes"} />
    <button disabled={pending} aria-pressed={active} className={"border px-5 py-3 text-sm font-semibold disabled:opacity-60 " + (active ? "border-stone-800 bg-stone-200 text-stone-900" : "border-stone-400 text-stone-800")}>{pending ? "Menyimpan..." : label}</button><Message state={state} />
  </form>;
}
export function CommentForm({ artworkId }) {
  const [state, action, pending] = useActionForm(commentAction);
  return <form action={action} aria-busy={pending} className="mt-6 space-y-3 border border-[var(--line)] bg-[#faf8f1] p-5">
    <input type="hidden" name="artworkId" value={artworkId} /><Message state={state} />
    <label htmlFor="comment-body" className="block text-sm font-semibold">Tulis komentar</label>
    <textarea id="comment-body" name="body" rows={3} required maxLength={1000} defaultValue={state.values.body} className={inputClass} aria-invalid={Boolean(state.fields.body)} aria-describedby="comment-help" />
    <p id="comment-help" className="text-xs leading-6 text-stone-600">Bagikan tanggapan dengan sopan. Maksimal 1.000 karakter.</p>
    {state.fields.body && <p className="text-sm text-red-800">{state.fields.body}</p>}
    <button disabled={pending} className="button-primary disabled:opacity-60">{pending ? "Mengirim..." : "Kirim komentar"}</button>
  </form>;
}
export function DeleteCommentForm({ commentId }) {
  const [state, action, pending] = useActionForm(deleteCommentAction);
  return <form action={action} className="mt-3 space-y-2" aria-busy={pending}><input type="hidden" name="commentId" value={commentId} /><Message state={state} /><button disabled={pending} className="text-xs font-semibold text-red-900 underline underline-offset-4 disabled:opacity-60">{pending ? "Menghapus..." : "Hapus komentar saya"}</button></form>;
}
export function ReportForm({ artworkId, reported }) {
  const [state, action, pending] = useActionForm(reportAction);
  if (reported) return <p className="mt-5 text-sm leading-6 text-stone-600">Kamu sudah melaporkan karya ini. Laporanmu sudah tercatat.</p>;
  return <details className="mt-6 text-sm"><summary className="w-fit cursor-pointer font-semibold text-red-900">Laporkan karya</summary>
    <form action={action} aria-busy={pending} className="mt-4 space-y-4 border border-[var(--line)] bg-[#faf8f1] p-5">
      <input type="hidden" name="artworkId" value={artworkId} /><Message state={state} />
      <p className="text-sm leading-6 text-stone-600">Satu Member hanya dapat melaporkan karya yang sama satu kali. Jelaskan masalah agar Admin dapat meninjaunya.</p>
      <div><label htmlFor="report-reason" className="block font-semibold">Alasan laporan</label><select id="report-reason" name="reason" required defaultValue={state.values.reason || ""} className={inputClass} aria-invalid={Boolean(state.fields.reason)}><option value="">Pilih alasan</option>{REPORT_REASONS.map((reason) => <option key={reason}>{reason}</option>)}</select>{state.fields.reason && <p className="mt-2 text-red-800">{state.fields.reason}</p>}</div>
      <div><label htmlFor="report-details" className="block font-semibold">Penjelasan laporan</label><textarea id="report-details" name="details" required minLength={10} maxLength={1000} rows={4} defaultValue={state.values.details} className={inputClass} aria-invalid={Boolean(state.fields.details)} /><p className="mt-2 text-xs leading-6 text-stone-600">Isi 10–1.000 karakter. Sertakan konteks yang membantu pemeriksaan.</p>{state.fields.details && <p className="mt-2 text-red-800">{state.fields.details}</p>}</div>
      <button disabled={pending} className="bg-red-900 px-5 py-3 font-semibold text-white disabled:opacity-60">{pending ? "Mengirim..." : "Kirim laporan"}</button>
    </form>
  </details>;
}
