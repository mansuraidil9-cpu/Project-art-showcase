import Link from "next/link";
import ArtworkCard from "@/components/artwork-card";

export default function WinnerCard({ winner, showChallenge = false }) {
  return <div className="min-w-0 border-t border-[var(--line)] pt-4"><p className="eyebrow mb-4">Juara {winner.rank}</p><ArtworkCard artwork={winner} />{showChallenge && <Link href={"/challenges/" + winner.challenge_id + "#pemenang"} className="text-link mt-5 inline-block max-w-full break-words text-xs leading-6">{winner.challenge_title}</Link>}</div>;
}
