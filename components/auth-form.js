"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, registerAction } from "@/app/actions/auth";

const initialState = { message: "", fields: {}, values: {} };

export default function AuthForm({ mode }) {
  const register = mode === "register";
  const [state, action, pending] = useActionState(register ? registerAction : loginAction, initialState);
  const fields = register ? [
    ["displayName", "Nama tampilan", "text", "nickname"],
    ["email", "Email", "email", "email"],
    ["password", "Password", "password", "new-password"],
    ["confirmation", "Konfirmasi password", "password", "new-password"],
  ] : [
    ["email", "Email", "email", "email"],
    ["password", "Password", "password", "current-password"],
  ];

  return (
    <form action={action} className="mt-8 space-y-5" aria-busy={pending}>
      {state.message && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">{state.message}</p>}
      {fields.map(([name, label, type, autoComplete]) => (
        <div key={name}>
          <label htmlFor={name} className="block text-sm font-semibold">{label}</label>
          <input id={name} name={name} type={type} autoComplete={autoComplete} required
            minLength={name === "displayName" ? 2 : register && type === "password" ? 10 : undefined}
            maxLength={name === "displayName" ? 80 : name === "email" ? 254 : 72}
            defaultValue={type === "password" ? undefined : state.values?.[name] || ""}
            aria-invalid={Boolean(state.fields?.[name])}
            aria-describedby={state.fields?.[name] ? name + "-error" : name === "password" && register ? "password-help" : undefined}
            className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-800" />
          {state.fields?.[name] && <p id={name + "-error"} className="mt-2 text-sm text-red-800">{state.fields[name]}</p>}
          {name === "password" && register && <p id="password-help" className="mt-2 text-xs leading-5 text-stone-600">Minimal 10 karakter. Maksimal 72 byte; huruf beraksen dan simbol dapat memakai lebih dari satu byte.</p>}
        </div>
      ))}
      {register && <div>
        <label htmlFor="role" className="block text-sm font-semibold">Daftar sebagai</label>
        <select id="role" name="role" defaultValue={state.values?.role === "curator" ? "curator" : "member"} className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-800" aria-describedby="role-help">
          <option value="member">Member — membagikan karya</option><option value="curator">Curator — mengadakan challenge</option>
        </select>
        <p id="role-help" className="mt-2 text-xs leading-5 text-stone-600">Akun Curator perlu persetujuan Admin sebelum membuka dashboard.</p>
        {state.fields?.role && <p className="mt-2 text-sm text-red-800">{state.fields.role}</p>}
      </div>}
      <button disabled={pending} className="w-full rounded-lg bg-stone-800 px-5 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-60">
        {pending ? "Memproses..." : register ? "Buat akun" : "Masuk"}
      </button>
      <p className="text-center text-sm text-stone-600">{register ? "Sudah punya akun? " : "Belum punya akun? "}
        <Link href={register ? "/login" : "/register"} className="font-semibold text-orange-900 underline underline-offset-4">{register ? "Masuk" : "Daftar"}</Link>
      </p>
    </form>
  );
}

