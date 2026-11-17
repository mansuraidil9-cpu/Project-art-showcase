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

export const metadata = { title: "Detail Karya | Atelier" };
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
  return <div className="site-container">
    <SiteHeader user={user} />
    <main id="konten" className="pb-20 pt-8 sm:pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/#galeri" className="text-link text-sm">Kembali ke galeri</Link>
        <p className="eyebrow">Katalog karya</p>
      </div>
      {message && member && <p role="status" className="mt-6 border border-[var(--line)] px-5 py-4 text-sm leading-7">{message}</p>}

      <div className="mt-8 grid items-start gap-9 lg:grid-cols-[1.65fr_1fr] lg:gap-14">
        <div className="min-w-0">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#e9e6db]">
            <Image src={artwork.file_path} alt={artwork.title} fill priority sizes="(max-width: 1023px) 100vw, 60vw" unoptimized={artwork.media_type === "image/svg+xml"} className="object-contain" />
          </div>
          <div className="mt-4 flex flex-wrap justify-between gap-3 border-b border-[var(--line)] pb-4 text-xs leading-6 text-[var(--muted)]">
            <span>{artwork.category} · {formatDate(artwork.created_at)}</span>
            <a href={artwork.file_path} target="_blank" rel="noopener noreferrer" className="text-link">Lihat gambar ukuran penuh</a>
          </div>
        </div>

        <section className="min-w-0 lg:pt-2">
          <p className="eyebrow">{artwork.category}</p>
          <h1 className="page-heading mt-4 break-words text-4xl leading-[1.08] sm:text-5xl">{artwork.title}</h1>
          <Link href={"/creators/" + artwork.member_id} className="text-link mt-5 inline-block max-w-full break-words text-sm">{artwork.display_name}</Link>
          <p className="mt-4 text-xs leading-6 text-[var(--muted)]">Dibagikan {formatDate(artwork.created_at)} WITA · {artwork.like_count} suka</p>
          <p className="mt-7 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--muted)]">{artwork.description}</p>
          <ul aria-label="Tags karya" className="mt-6 flex flex-wrap gap-2">
            {artwork.tags.map((tag) => <li key={tag} className="max-w-full break-words border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--muted)]">{tag}</li>)}
          </ul>
          {member && <div className="mt-8 border-t border-[var(--line)] pt-6">
            <div className="flex flex-wrap gap-3"><InteractionButton artworkId={id} kind="like" active={state.liked} /><InteractionButton artworkId={id} kind="favorite" active={state.favorited} /></div>
            {!owner && <ReportForm artworkId={id} reported={Boolean(state.report_status)} />}
          </div>}
          {!user && <p className="mt-8 border-t border-[var(--line)] pt-5 text-sm leading-7 text-[var(--muted)]"><Link href="/login" className="text-link">Masuk sebagai Member</Link> untuk menyukai, menyimpan, berkomentar, dan melaporkan karya.</p>}
          {owner && <div className="mt-8 space-y-5 border-t border-[var(--line)] pt-6"><Link href={"/dashboard/member/artworks/" + id + "/edit"} className="button-secondary">Edit karya</Link><DeleteArtworkForm id={id} title={artwork.title} /></div>}
        </section>
      </div>

      <section className="mt-16 max-w-3xl border-t border-[var(--line)] pt-8 sm:mt-20" aria-labelledby="comments-title">
        <p className="eyebrow">Ruang bertukar pandangan</p>
        <h2 id="comments-title" className="mt-3 font-serif text-3xl">Percakapan <span className="text-[var(--muted)]">({comments.length})</span></h2>
        {member && <CommentForm artworkId={id} />}
        {comments.length ? <div className="mt-6">
          {comments.map((comment) => <article key={comment.id} className="border-b border-[var(--line)] py-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3"><Link href={"/creators/" + comment.member_id} className="max-w-full break-words text-sm font-semibold text-[var(--ink)]">{comment.display_name}</Link><p className="text-xs text-[var(--muted)]">{formatDate(comment.created_at)} WITA</p></div>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--muted)]">{comment.body}</p>
            {member && comment.member_id === user.id && <DeleteCommentForm commentId={comment.id} />}
          </article>)}
        </div> : <p className="mt-6 border-b border-[var(--line)] py-6 text-sm text-[var(--muted)]">Belum ada komentar pada karya ini.</p>}
      </section>
    </main>
  </div>;
}

