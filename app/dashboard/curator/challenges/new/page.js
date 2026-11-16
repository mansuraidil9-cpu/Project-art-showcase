import { requireUser } from "@/lib/auth";
import { ChallengeForm } from "@/components/challenge-forms";

export const metadata = { title: "Buat Challenge | Ruang Karya" };
export default async function NewChallengePage() {
  await requireUser({ roles: ["curator"] });
  return <div className="max-w-2xl"><h1 className="font-serif text-4xl">Buat challenge.</h1><p className="mt-4 leading-7 text-stone-600">Undang kreator untuk menafsirkan sebuah tema. Lengkapi semua isian dan gunakan jadwal WITA.</p><div className="mt-8 rounded-xl border border-stone-300 bg-white p-5 sm:p-7"><ChallengeForm /></div></div>;
}
