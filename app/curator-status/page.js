import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import DeleteAccountForm from "@/components/delete-account-form";
import SiteHeader from "@/components/site-header";

export const metadata = { title: "Status Curator | Atelier" };
export default async function CuratorStatus() {
  const user = await requireUser({ roles: ["curator"], allowUnapproved: true });
  if (user.curator_status === "approved") redirect("/dashboard/curator");
  const rejected = user.curator_status === "rejected";
  return <div className="site-container">
    <SiteHeader user={user} />
    <main id="konten" className="mx-auto max-w-2xl py-12 sm:py-20">
      <p className="eyebrow">STATUS CURATOR</p>
      <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">{rejected ? "Pendaftaran belum disetujui." : "Akun Anda sedang ditinjau."}</h1>
      <p className="mt-5 leading-7 text-stone-600">{rejected ? user.rejection_reason : "Terima kasih sudah mendaftar, " + user.display_name + ". Admin akan memeriksa akunmu sebelum akses dashboard dibuka."}</p>
      <p className="mt-4 text-sm leading-6 text-stone-600">Kamu tetap dapat menjelajahi karya dan challenge yang tersedia untuk publik.</p>
      <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-[var(--line)] pt-7 text-sm"><Link href="/" className="button-primary">Jelajahi beranda</Link><form action="/curator-status" method="get"><button className="text-link">Periksa status lagi</button></form></div>
      {rejected && <DeleteAccountForm />}
    </main>
  </div>;
}

