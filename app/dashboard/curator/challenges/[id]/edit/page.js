import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session-token";
import { ChallengeError, getOwnedChallenge } from "@/lib/challenges";
import { parseId } from "@/lib/validation";
import { ChallengeForm } from "@/components/challenge-forms";

export const metadata = { title: "Edit Challenge | Ruang Karya" };
export default async function EditChallengePage({ params }) {
  await requireUser({ roles: ["curator"] });
  const id = parseId((await params).id);if (!id) notFound();
  let challenge;
  try { challenge = await getOwnedChallenge((await cookies()).get(SESSION_COOKIE)?.value, id); }
  catch (error) { if (error instanceof ChallengeError && error.code === "NOT_FOUND") notFound();throw error; }
  return <div className="max-w-2xl"><h1 className="font-serif text-4xl">Edit challenge.</h1><p className="mt-4 leading-7 text-stone-600">Perbarui cerita, aturan, hadiah, jadwal, atau banner challenge milikmu.</p><div className="mt-8 rounded-xl border border-stone-300 bg-white p-5 sm:p-7"><ChallengeForm challenge={challenge} /></div></div>;
}
