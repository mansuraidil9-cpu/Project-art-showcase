import { requireUser } from "@/lib/auth";
import { EmailForm, PasswordForm } from "@/components/profile-forms";

export const metadata = { title: "Pengaturan Akun | Atelier" };
export default async function AccountPage() {
  const user = await requireUser({ roles: ["member"] });
  return <div className="max-w-2xl"><h1 className="page-heading">Akun privat</h1><p className="mt-4 leading-7 text-[var(--muted)]">Email dan password hanya digunakan untuk akses akun. Keduanya tidak ditampilkan pada profil publik.</p><p className="mt-5 bg-[#e6e2d5] p-4 text-sm leading-7">Setelah perubahan berhasil, semua sesi akun akan diakhiri. Masuk kembali menggunakan email dan password terbaru.</p>
    <section className="mt-8 panel p-5 sm:p-7"><h2 className="mb-6 font-serif text-2xl">Ubah email</h2><EmailForm email={user.email} /></section>
    <section className="mt-8 panel p-5 sm:p-7"><h2 className="mb-6 font-serif text-2xl">Ubah password</h2><PasswordForm /></section></div>;
}
