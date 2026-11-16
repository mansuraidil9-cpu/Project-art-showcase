import Image from "next/image";
import Link from "next/link";
import { DeleteArtworkForm } from "./artwork-form";

export default function ArtworkCard({ artwork, manage = false }) {
  return <article className="min-w-0">
    <Link href={"/artworks/" + artwork.id} aria-label={"Lihat karya " + artwork.title} className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-stone-200">
      <Image src={artwork.file_path} alt={artwork.title} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" unoptimized={artwork.media_type === "image/svg+xml"} className="object-cover transition-transform duration-300 hover:scale-[1.02]" />
    </Link>
    <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-stone-500"><span>{artwork.category}</span><span>{artwork.like_count} suka</span></div>
    <h3 className="mt-2 break-words text-lg font-semibold"><Link href={"/artworks/" + artwork.id} className="text-stone-800">{artwork.title}</Link></h3>
    <Link href={"/creators/" + artwork.member_id} className="mt-1 inline-block max-w-full break-words text-sm text-stone-600">{artwork.display_name}</Link>
    {manage && <div className="mt-4 space-y-3 border-t border-stone-200 pt-4"><Link href={"/dashboard/member/artworks/" + artwork.id + "/edit"} className="inline-block text-sm font-semibold text-orange-900 underline underline-offset-4">Edit karya</Link><DeleteArtworkForm id={artwork.id} title={artwork.title} /></div>}
  </article>;
}

