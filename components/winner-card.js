import Link from "next/link";
import ArtworkCard from "@/components/artwork-card";

export default function WinnerCard({ winner, showChallenge = false }) {
  return <div className="min-w-0 rounded-xl border border-stone-300 bg-white p-4"><p className="mb-4 text-sm font-semibold text-orange-900">Juara {winner.rank}</p><ArtworkCard artwork={winner} />{showChallenge && <Link href={"/challenges/" + winner.challenge_id + "#pemenang"} className="mt-5 inline-block max-w-full break-words text-sm font-semibold text-stone-800 underline underline-offset-4">{winner.challenge_title}</Link>}</div>;
}
