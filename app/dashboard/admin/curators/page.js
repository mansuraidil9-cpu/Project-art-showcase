import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { CuratorDecisionForm } from "@/components/admin/forms";

export const metadata = { title: "Verifikasi Curator | Admin Ruang Karya" };
export default async function CuratorsPage({ searchParams }) {
  await requireUser({ roles: ["admin"] });
  const curators = (await query("curatorsPending")).rows;
  const { notice } = await searchParams;
  const message = new Map([["approved", "Curator disetujui. Dashboard Curator sudah dapat diakses."], ["rejected", "Pendaftaran ditolak dan alasan sudah tersedia pada halaman status Curator."]]).get(notice);
  return <>
    <p className="text-xs font-semibold tracking-widest text-orange-800">ADMIN / VERIFIKASI CURATOR</p>
    <h1 className="mt-3 font-serif text-4xl">Temui penggerak komunitas.</h1>
    <p className="mt-4 max-w-2xl leading-7 text-stone-600">Tinjau pendaftaran yang menunggu persetujuan. Sertakan alasan yang jelas jika pendaftaran ditolak.</p>
    {message && <p role="status" className="mt-6 rounded-lg bg-stone-200 p-4 text-sm leading-6">{message}</p>}
    <p className="mt-7 text-sm text-stone-600">{curators.length} pendaftaran menunggu</p>
    {!curators.length ? <p className="mt-5 rounded-xl border border-dashed border-stone-300 p-8 leading-7 text-stone-600">Tidak ada pendaftaran Curator yang menunggu. Semua pendaftaran sudah ditinjau.</p> : <div className="mt-5 grid items-start gap-6 md:grid-cols-2">
      {curators.map((curator) => <article key={curator.id} className="min-w-0 rounded-xl border border-stone-300 bg-white p-5 sm:p-6">
        <h2 className="break-words text-xl font-semibold">{curator.display_name}</h2>
        <p className="mt-2 break-all text-sm text-stone-600">{curator.email}</p>
        <p className="mt-2 text-xs text-stone-500">Mendaftar {formatDate(curator.created_at)} WITA</p>
        <p className="mt-5 break-words text-sm leading-7 text-stone-600">{curator.bio || "Belum ada bio."}</p>
        <div className="mt-6 space-y-4"><CuratorDecisionForm id={curator.id} decision="approved" /><CuratorDecisionForm id={curator.id} decision="rejected" /></div>
      </article>)}
    </div>}
  </>;
}

