import AuthForm from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { userDestination } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata = { title: "Daftar | Atelier" };
export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(userDestination(user));
  return <>
    <p className="eyebrow">MULAI DARI SINI</p>
    <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Awal cerita barumu.</h1>
    <p className="mt-4 text-sm leading-6 text-stone-600">Bergabung dengan Atelier sebagai kreator atau penggerak komunitas.</p>
    <AuthForm mode="register" />
  </>;
}

