import Image from "next/image";
import Link from "next/link";
import { DeleteArtworkForm } from "./artwork-form";

export default function ArtworkCard({ artwork, manage = false, index }) {
  return <article className="artwork-card">
    <Link href={"/artworks/" + artwork.id} aria-label={"Lihat karya " + artwork.title} className="artwork-image">
      {Number.isInteger(index) && <span aria-hidden="true" className="artwork-number">{String(index + 1).padStart(2, "0")}</span>}
      <Image src={artwork.file_path} alt={artwork.title} fill sizes="(max-width: 600px) 50vw, (max-width: 850px) 50vw, 25vw" unoptimized={artwork.media_type === "image/svg+xml"} className="object-cover" />
    </Link>
    <Link href={"/creators/" + artwork.member_id} className="mt-3 inline-block max-w-full break-words text-xs text-[var(--muted)]">{artwork.display_name}</Link>
    <h3 className="artwork-title break-words"><Link href={"/artworks/" + artwork.id} className="text-[var(--ink)]">{artwork.title}</Link></h3>
    <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs leading-5 text-[var(--muted)]"><span>{artwork.category}</span><span>{artwork.like_count} suka</span></div>
    {manage && <div className="mt-4 space-y-3 border-t border-stone-300 pt-4"><Link href={"/dashboard/member/artworks/" + artwork.id + "/edit"} className="text-link inline-block text-sm">Edit karya</Link><DeleteArtworkForm id={artwork.id} title={artwork.title} /></div>}
  </article>;
}

