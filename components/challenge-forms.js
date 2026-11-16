"use client";

import Image from "next/image";
import { startTransition, useEffect, useState } from "react";
import useActionForm from "@/components/use-action-form";
import { saveChallengeAction, deleteChallengeAction, submitArtworkAction, withdrawSubmissionAction } from "@/app/actions/challenges";
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/artwork-rules";
import { formatWitaInput } from "@/lib/challenge-rules";

const inputClass = "mt-2 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800";
const buttonClass = "rounded-lg bg-stone-800 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60";
function Message({ state }) { return state.message && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm leading-6 text-red-900">{state.message}</p>; }
function FieldError({ state, name }) { return state.fields[name] && <p id={name + "-error"} className="mt-2 text-sm text-red-800">{state.fields[name]}</p>; }

export function ChallengeForm({ challenge }) {
  const [file, setFile] = useState(null), [preview, setPreview] = useState(null), [fileError, setFileError] = useState("");
  async function save(previous, form) { if (file) form.set("file", file); return saveChallengeAction(previous, form); }
  const [state, action, pending] = useActionForm(save);
  const values = Object.keys(state.values).length ? state.values : { title: challenge?.title || "", description: challenge?.description || "", rules: challenge?.rules || "", prize: challenge?.prize || "", startsAt: challenge ? formatWitaInput(challenge.starts_at) : "", endsAt: challenge ? formatWitaInput(challenge.ends_at) : "" };
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  function chooseFile(event) {
    const selected = event.target.files?.[0] || null;setFile(selected);
    const error = selected && (!IMAGE_TYPES.includes(selected.type) ? "Gunakan JPEG, PNG, atau WebP." : selected.size > MAX_IMAGE_BYTES ? "Ukuran banner maksimal 5 MB." : "");
    setFileError(error || "");setPreview(selected && !error ? URL.createObjectURL(selected) : null);
  }
  function submit(event) { event.preventDefault(); const form = new FormData(event.currentTarget);startTransition(() => action(form)); }
  return <form method="post" onSubmit={submit} className="space-y-6" aria-busy={pending}><input type="hidden" name="id" value={challenge?.id || ""} /><Message state={state} />
    <div><label htmlFor="title" className="block text-sm font-semibold">Judul challenge</label><input id="title" name="title" required maxLength={150} defaultValue={values.title} className={inputClass} aria-invalid={Boolean(state.fields.title)} aria-describedby={state.fields.title ? "title-error" : undefined} /><FieldError state={state} name="title" /></div>
    {[["description", "Deskripsi", 5000, 5], ["rules", "Aturan", 5000, 4], ["prize", "Hadiah", 1000, 3]].map(([name, label, maximum, rows]) => <div key={name}><label htmlFor={name} className="block text-sm font-semibold">{label}</label><textarea id={name} name={name} required maxLength={maximum} rows={rows} defaultValue={values[name]} className={inputClass} aria-invalid={Boolean(state.fields[name])} aria-describedby={state.fields[name] ? name + "-error" : undefined} /><FieldError state={state} name={name} /></div>)}
    <fieldset><legend className="text-sm font-semibold">Jadwal dalam WITA (UTC+8)</legend><p className="mt-2 text-xs leading-6 text-stone-600">Waktu selesai harus setelah waktu mulai. Semua peserta mengikuti jadwal WITA.</p>{challenge?.has_winners && <p className="mt-2 text-sm leading-6 text-stone-600">Pemenang sudah tercatat; jadwal challenge dikunci.</p>}<div className="mt-4 grid gap-5 sm:grid-cols-2">{[["startsAt", "Mulai"], ["endsAt", "Selesai"]].map(([name, label]) => <div key={name} className="min-w-0"><label htmlFor={name} className="block text-sm font-semibold">{label}</label><input id={name} name={name} type="datetime-local" required readOnly={Boolean(challenge?.has_winners)} defaultValue={values[name]} className={inputClass + " min-w-0 read-only:bg-stone-100"} aria-invalid={Boolean(state.fields[name])} aria-describedby={state.fields[name] ? name + "-error" : undefined} /><FieldError state={state} name={name} /></div>)}</div></fieldset>
    <div><label htmlFor="banner-file" className="block text-sm font-semibold">Banner challenge</label>{(preview || challenge?.banner_path) && <Image src={preview || challenge.banner_path} alt="Pratinjau banner challenge" width={900} height={450} unoptimized className="mt-3 max-h-72 w-full rounded-xl object-cover" />}<div className="mt-3 rounded-lg border border-stone-300 bg-white p-3"><input id="banner-file" name="file" type="file" required={!challenge && !file} accept="image/jpeg,image/png,image/webp" disabled={pending} onChange={chooseFile} className="peer sr-only" aria-label="Banner challenge" aria-describedby="banner-help" /><label htmlFor="banner-file" className="inline-block cursor-pointer rounded-md bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-800 peer-focus-visible:outline-2 peer-focus-visible:outline-orange-800">Pilih banner</label><p className="mt-3 break-all text-xs leading-6 text-stone-600">{file?.name || (challenge ? "Banner saat ini dipertahankan." : "Belum ada banner dipilih.")}</p></div><p id="banner-help" className="mt-2 text-xs leading-6 text-stone-600">JPEG, PNG, atau WebP statis. Maksimal 5 MB dan 20 megapiksel. {challenge && "Pilih file baru jika ingin mengganti banner."}</p>{(fileError || state.fields.file) && <p role="alert" className="mt-2 text-sm text-red-800">{fileError || state.fields.file}</p>}</div>
    <button disabled={pending || Boolean(fileError)} className={buttonClass}>{pending ? "Menyimpan..." : challenge ? "Simpan perubahan" : "Buat challenge"}</button>
  </form>;
}

export function DeleteChallengeForm({ id, title }) {
  const [state, action, pending] = useActionForm(deleteChallengeAction);
  return <details className="mt-5 text-sm"><summary className="w-fit cursor-pointer font-semibold text-red-900">Hapus challenge</summary><form action={action} className="mt-4 space-y-4 rounded-lg border border-red-200 bg-white p-4" aria-busy={pending}><input type="hidden" name="id" value={id} /><Message state={state} /><p className="leading-7 text-stone-600">Challenge, submisi, dan penetapan pemenangnya akan dihapus permanen. Karya asli peserta tetap ada di portofolio.</p><label className="flex items-start gap-3 leading-6"><input type="checkbox" name="confirmation" value="yes" required className="mt-1 shrink-0 accent-red-900" /><span className="min-w-0 break-words">Saya ingin menghapus <strong>{title}</strong>.</span></label><button disabled={pending} className="rounded-lg bg-red-900 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{pending ? "Menghapus..." : "Konfirmasi hapus challenge"}</button></form></details>;
}

export function SubmissionForm({ challengeId, artworks }) {
  const [state, action, pending] = useActionForm(submitArtworkAction);
  return <form action={action} className="mt-5 space-y-4" aria-busy={pending}><input type="hidden" name="challengeId" value={challengeId} /><Message state={state} /><div><label htmlFor="submission-artwork" className="block text-sm font-semibold">Pilih karya dari portofoliomu</label><select id="submission-artwork" name="artworkId" required defaultValue={state.values.artworkId || ""} className={inputClass} aria-invalid={Boolean(state.fields.artworkId)}><option value="">Pilih satu karya</option>{artworks.map((artwork) => <option key={artwork.id} value={artwork.id}>{artwork.title}</option>)}</select><FieldError state={state} name="artworkId" /></div><p className="text-xs leading-6 text-stone-600">Maksimal satu karya per challenge. Kamu bisa menarik dan mengirim ulang selama challenge masih berlangsung.</p><button disabled={pending} className={buttonClass}>{pending ? "Mengirim..." : "Kirim karya ke challenge"}</button></form>;
}

export function WithdrawForm({ challengeId }) {
  const [state, action, pending] = useActionForm(withdrawSubmissionAction);
  return <form action={action} className="mt-5 space-y-3" aria-busy={pending}><input type="hidden" name="challengeId" value={challengeId} /><Message state={state} /><button disabled={pending} className="rounded-lg border border-stone-400 px-5 py-3 text-sm font-semibold text-stone-800 disabled:opacity-60">{pending ? "Menarik..." : "Tarik submisi"}</button></form>;
}
