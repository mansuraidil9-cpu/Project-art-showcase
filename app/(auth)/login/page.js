import AuthForm from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { userDestination } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata = { title: "Masuk | Ruang Karya" };
export default async function LoginPage({ searchParams }) {
  const user = await getCurrentUser();
  if (user) redirect(userDestination(user));
  const params = await searchParams;
  return <>
    <p className="text-xs font-semibold tracking-widest text-orange-800">SELAMAT DATANG KEMBALI</p>
    <h1 className="mt-3 font-serif text-4xl">Masuk ke ruangmu.</h1>
    <p className="mt-4 text-sm leading-6 text-stone-600">Lanjutkan cerita dan perjalanan kreatifmu.</p>
    {params.account === "deleted" && <p role="status" className="mt-6 rounded-lg bg-stone-200 p-4 text-sm leading-6 text-stone-800">Akun sudah dihapus. Kamu dapat mendaftar kembali jika ingin bergabung.</p>}
    <AuthForm mode="login" />
  </>;
}

