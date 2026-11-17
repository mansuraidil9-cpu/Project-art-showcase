"use client";

import Image from "next/image";
import { startTransition, useEffect, useState } from "react";
import useActionForm from "@/components/use-action-form";
import { profileAction, emailAction, passwordAction } from "@/app/actions/member";
import { IMAGE_TYPES } from "@/lib/artwork-rules";

const inputClass = "mt-2 field-input text-sm";
const buttonClass = "button-primary disabled:cursor-not-allowed disabled:opacity-60";
function Message({ state }) { return state.message && <p role="alert" className="bg-red-50 p-4 text-sm leading-6 text-red-900">{state.message}</p>; }
function Field({ name, label, state, type = "text", defaultValue, ...props }) {
  return <div><label htmlFor={name} className="block text-sm font-semibold">{label}</label><input id={name} name={name} type={type} defaultValue={defaultValue} className={inputClass} aria-invalid={Boolean(state.fields[name])} aria-describedby={state.fields[name] ? name + "-error" : undefined} {...props} />{state.fields[name] && <p id={name + "-error"} className="mt-2 text-sm text-red-800">{state.fields[name]}</p>}</div>;
}

export function ProfileForm({ profile }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileError, setFileError] = useState("");
  async function save(previous, form) { if (file) form.set("file", file); return profileAction(previous, form); }
  const [state, action, pending] = useActionForm(save);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const values = Object.keys(state.values).length ? state.values : { displayName: profile.display_name, bio: profile.bio, website: profile.website_url || "", instagram: profile.instagram_url || "", behance: profile.behance_url || "" };
  function chooseFile(event) {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    const error = selected && (!IMAGE_TYPES.includes(selected.type) ? "Gunakan JPEG, PNG, atau WebP." : selected.size > 2 * 1024 * 1024 ? "Foto profil maksimal 2 MB." : "");
    setFileError(error || "");
    setPreview(selected && !error ? URL.createObjectURL(selected) : null);
  }
  function submit(event) { event.preventDefault(); const form = new FormData(event.currentTarget); startTransition(() => action(form)); }
  return <form method="post" onSubmit={submit} className="space-y-6" aria-busy={pending}>
    <Message state={state} /><Field name="displayName" label="Nama tampilan" state={state} defaultValue={values.displayName} required minLength={2} maxLength={80} autoComplete="nickname" />
    <div><label htmlFor="bio" className="block text-sm font-semibold">Bio</label><textarea id="bio" name="bio" rows={4} maxLength={500} defaultValue={values.bio} className={inputClass} aria-invalid={Boolean(state.fields.bio)} /><p className="mt-2 text-xs leading-6 text-stone-600">Ceritakan dirimu dalam maksimal 500 karakter.</p>{state.fields.bio && <p className="mt-2 text-sm text-red-800">{state.fields.bio}</p>}</div>
    <div><label htmlFor="profile-file" className="block text-sm font-semibold">Foto profil</label>
      {(preview || profile.avatar_path) && <Image src={preview || profile.avatar_path} alt="Pratinjau foto profil" width={120} height={120} unoptimized className="mt-3 h-28 w-28 rounded-full object-cover" />}
      <div className="mt-3 border border-[var(--line)] bg-[#faf8f1] p-3"><input id="profile-file" name="file" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseFile} disabled={pending} className="peer sr-only" aria-label="Foto profil" aria-describedby="photo-help" /><label htmlFor="profile-file" className="inline-block cursor-pointer bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-800 peer-focus-visible:outline-2 peer-focus-visible:outline-stone-900">Pilih foto</label><p className="mt-3 break-all text-xs leading-6 text-stone-600">{file?.name || "Tidak ada foto baru dipilih."}</p>{file && <button type="button" onClick={() => { setFile(null); setPreview(null); setFileError(""); document.getElementById("profile-file").value = ""; }} className="mt-2 text-xs font-semibold text-stone-700 underline">Batalkan foto baru</button>}</div>
      <p id="photo-help" className="mt-2 text-xs leading-6 text-stone-600">JPEG, PNG, atau WebP, maksimal 2 MB dan 20 megapiksel. Foto diperkecil hingga 1.024 piksel.</p>
      {(fileError || state.fields.file) && <p role="alert" className="mt-2 text-sm text-red-800">{fileError || state.fields.file}</p>}
      {profile.avatar_path && <label className="mt-4 flex items-center gap-3 text-sm text-stone-700"><input type="checkbox" name="removePhoto" value="yes" disabled={Boolean(file)} className="accent-stone-800" />Hapus foto profil saat ini</label>}
    </div>
    <Field name="website" label="Website" type="url" state={state} defaultValue={values.website} maxLength={2048} placeholder="https://namamu.com" />
    <Field name="instagram" label="Instagram" type="url" state={state} defaultValue={values.instagram} maxLength={2048} placeholder="https://www.instagram.com/namamu" />
    <Field name="behance" label="Behance" type="url" state={state} defaultValue={values.behance} maxLength={2048} placeholder="https://www.behance.net/namamu" />
    <button disabled={pending || Boolean(fileError)} className={buttonClass}>{pending ? "Menyimpan..." : "Simpan profil"}</button>
  </form>;
}

export function EmailForm({ email }) {
  const [state, action, pending] = useActionForm(emailAction);
  return <form action={action} className="space-y-5" aria-busy={pending}><Message state={state} />
    <Field name="email" label="Email baru" type="email" state={state} defaultValue={state.values.email ?? email} required maxLength={254} autoComplete="email" />
    <Field name="currentPassword" label="Password saat ini untuk mengubah email" type="password" state={state} required autoComplete="current-password" />
    <button disabled={pending} className={buttonClass}>{pending ? "Menyimpan..." : "Ubah email"}</button>
  </form>;
}
export function PasswordForm() {
  const [state, action, pending] = useActionForm(passwordAction);
  return <form action={action} className="space-y-5" aria-busy={pending}><Message state={state} />
    <div><label htmlFor="password-current" className="block text-sm font-semibold">Password saat ini untuk mengubah password</label><input id="password-current" name="currentPassword" type="password" required autoComplete="current-password" className={inputClass} aria-invalid={Boolean(state.fields.currentPassword)} />{state.fields.currentPassword && <p className="mt-2 text-sm text-red-800">{state.fields.currentPassword}</p>}</div>
    <Field name="password" label="Password baru" type="password" state={state} required minLength={10} autoComplete="new-password" />
    <p className="text-xs leading-6 text-stone-600">Minimal 10 karakter dan maksimal 72 byte. Gunakan password yang berbeda dari sebelumnya.</p>
    <Field name="confirmation" label="Konfirmasi password baru" type="password" state={state} required minLength={10} autoComplete="new-password" />
    <button disabled={pending} className={buttonClass}>{pending ? "Menyimpan..." : "Ubah password"}</button>
  </form>;
}
