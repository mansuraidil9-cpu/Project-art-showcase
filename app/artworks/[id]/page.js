import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site-header";
import { DeleteArtworkForm } from "@/components/artwork-form";
import { InteractionButton, CommentForm, DeleteCommentForm, ReportForm } from "@/components/interaction-forms";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { parseId } from "@/lib/validation";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Detail Karya | Ruang Karya" };
export default async function ArtworkDetail({ params, searchParams }) {
  const id = parseId((await params).id);
  if (!id) notFound();
  const artwork = (await query("artworkDetail", [id])).rows[0];
  if (!artwork) notFound();
  const user = await getCurrentUser();
  const comments = (await query("artworkComments", [id])).rows;
  const owner = user?.role === "member" && user.id === artwork.member_id;
  const member = user?.role === "member";
  const state = member ? (await query("interactionState", [id, user.id])).rows[0] : null;
  const message = new Map([["created", "Karya berhasil diunggah."], ["updated", "Cerita karya berhasil diperbarui."], ["interaction", "Pilihanmu berhasil disimpan."], ["comment", "Komentar berhasil dikirim."], ["comment-deleted", "Komentar berhasil dihapus."], ["reported", "Laporan berhasil dikirim untuk ditinjau Admin."]]).get((await searchParams).notice);
  return <div className="mx-auto max-w-6xl px-5 sm:px-9"><SiteHeader user={user} /><main id="konten" className="py-10">
    <Link href="/#galeri" className="text-sm text-stone-700 underline underline-offset-4">Kembali ke galeri</Link>
    {message && member && <p role="status" className="mt-5 rounded-lg bg-stone-200 p-4 text-sm">{message}</p>}
    <div className="mt-7 grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div><div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-stone-200 bg-stone-100"><Image src={artwork.file_path} alt={artwork.title} fill priority sizes="(max-width: 1023px) 100vw, 65vw" unoptimized={artwork.media_type === "image/svg+xml"} className="object-contain" /></div><a href={artwork.file_path} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-stone-700 underline underline-offset-4">Lihat gambar ukuran penuh</a></div>
      <section className="min-w-0"><p className="text-xs font-semibold tracking-widest text-orange-800">{artwork.category}</p><h1 className="mt-3 break-words font-serif text-4xl leading-tight">{artwork.title}</h1><Link href={"/creators/" + artwork.member_id} className="mt-4 inline-block max-w-full break-words font-semibold text-stone-800 underline underline-offset-4">{artwork.display_name}</Link><p className="mt-3 text-xs leading-6 text-stone-500">Dibagikan {formatDate(artwork.created_at)} WITA · {artwork.like_count} suka</p><p className="mt-6 whitespace-pre-wrap break-words leading-7 text-stone-600">{artwork.description}</p><ul aria-label="Tags karya" className="mt-6 flex flex-wrap gap-2">{artwork.tags.map((tag) => <li key={tag} className="max-w-full break-words rounded-full bg-stone-200 px-3 py-1.5 text-xs text-stone-700">{tag}</li>)}</ul>
        {member && <div className="mt-7"><div className="flex flex-wrap gap-3"><InteractionButton artworkId={id} kind="like" active={state.liked} /><InteractionButton artworkId={id} kind="favorite" active={state.favorited} /></div>{!owner && <ReportForm artworkId={id} reported={Boolean(state.report_status)} />}</div>}
        {!user && <p className="mt-7 text-sm leading-7 text-stone-600"><Link href="/login" className="font-semibold text-stone-800 underline underline-offset-4">Masuk sebagai Member</Link> untuk menyukai, menyimpan, berkomentar, dan melaporkan karya.</p>}
        {owner && <div className="mt-8 space-y-5 border-t border-stone-300 pt-6"><Link href={"/dashboard/member/artworks/" + id + "/edit"} className="inline-block rounded-lg border border-stone-400 px-5 py-3 text-sm font-semibold text-stone-800">Edit karya</Link><DeleteArtworkForm id={id} title={artwork.title} /></div>}
      </section>
    </div>
    <section className="mt-14 max-w-3xl border-t border-stone-300 pt-8" aria-labelledby="comments-title"><h2 id="comments-title" className="font-serif text-2xl">Percakapan <span className="text-stone-500">({comments.length})</span></h2>{member && <CommentForm artworkId={id} />}{comments.length ? <div className="mt-6 space-y-5">{comments.map((comment) => <article key={comment.id} className="rounded-xl border border-stone-200 bg-white p-5"><Link href={"/creators/" + comment.member_id} className="font-semibold text-stone-800">{comment.display_name}</Link><p className="mt-2 text-xs text-stone-500">{formatDate(comment.created_at)} WITA</p><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-stone-600">{comment.body}</p>{member && comment.member_id === user.id && <DeleteCommentForm commentId={comment.id} />}</article>)}</div> : <p className="mt-5 rounded-xl border border-dashed border-stone-300 p-6 text-sm text-stone-600">Belum ada komentar pada karya ini.</p>}</section>
  </main></div>;
}

