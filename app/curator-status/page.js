import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import DeleteAccountForm from "@/components/delete-account-form";
import SiteHeader from "@/components/site-header";

export const metadata = { title: "Status Curator | Ruang Karya" };
export default async function CuratorStatus() {
  const user = await requireUser({ roles: ["curator"], allowUnapproved: true });
  if (user.curator_status === "approved") redirect("/dashboard/curator");
  const rejected = user.curator_status === "rejected";
  return <div className="mx-auto max-w-6xl px-5 sm:px-9">
    <SiteHeader user={user} />
    <main id="konten" className="mx-auto max-w-2xl py-12">
      <p className="text-xs font-semibold tracking-widest text-orange-800">STATUS CURATOR</p>
      <h1 className="mt-4 font-serif text-4xl">{rejected ? "Pendaftaran belum disetujui." : "Akun Anda sedang ditinjau."}</h1>
      <p className="mt-5 leading-7 text-stone-600">{rejected ? user.rejection_reason : "Terima kasih sudah mendaftar, " + user.display_name + ". Admin akan memeriksa akunmu sebelum akses dashboard dibuka."}</p>
      <p className="mt-4 text-sm leading-6 text-stone-600">Kamu tetap dapat menjelajahi karya dan challenge yang tersedia untuk publik.</p>
      <div className="mt-7 flex flex-wrap gap-5 text-sm"><Link href="/" className="font-semibold text-stone-800 underline underline-offset-4">Jelajahi beranda</Link><form action="/curator-status" method="get"><button className="text-stone-800 underline underline-offset-4">Periksa status lagi</button></form></div>
      {rejected && <DeleteAccountForm />}
    </main>
  </div>;
}

