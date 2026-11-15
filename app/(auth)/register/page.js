import AuthForm from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { userDestination } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata = { title: "Daftar | Ruang Karya" };
export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(userDestination(user));
  return <>
    <p className="text-xs font-semibold tracking-widest text-orange-800">MULAI DARI SINI</p>
    <h1 className="mt-3 font-serif text-4xl">Temukan ruang kreatifmu.</h1>
    <p className="mt-4 text-sm leading-6 text-stone-600">Daftar sebagai kreator atau penggerak komunitas.</p>
    <AuthForm mode="register" />
  </>;
}

