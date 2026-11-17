import AuthForm from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { userDestination } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata = { title: "Masuk | Atelier" };
export default async function LoginPage({ searchParams }) {
  const user = await getCurrentUser();
  if (user) redirect(userDestination(user));
  const params = await searchParams;
  const notice = new Map([["deleted", "Akun sudah dihapus. Kamu dapat mendaftar kembali jika ingin bergabung."], ["email-updated", "Email berhasil diubah. Semua sesi telah diakhiri. Masuk kembali dengan email baru."], ["password-updated", "Password berhasil diubah. Semua sesi telah diakhiri. Masuk kembali dengan password baru."]]).get(params.account);
  return <>
    <p className="eyebrow">SELAMAT DATANG KEMBALI</p>
    <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Masuk ke Atelier.</h1>
    <p className="mt-4 text-sm leading-6 text-stone-600">Lanjutkan cerita dan perjalanan kreatifmu.</p>
    {notice && <p role="status" className="mt-6 border border-[var(--line)] bg-[#e9e6da] p-4 text-sm leading-6 text-stone-800">{notice}</p>}
    <AuthForm mode="login" />
  </>;
}

