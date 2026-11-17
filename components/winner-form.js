"use client";

import { startTransition, useState } from "react";
import useActionForm from "@/components/use-action-form";
import { selectWinnersAction } from "@/app/actions/challenges";

export default function WinnerForm({ challengeId, candidates, winners, expectedVersion }) {
  const [choices, setChoices] = useState(Object.fromEntries([1, 2, 3].map((rank) => ["rank" + rank, String(winners.find((winner) => winner.rank === rank)?.submission_id || "")])));
  const [state, action, pending] = useActionForm(selectWinnersAction);
  const selected = Object.values(choices).filter(Boolean), duplicates = new Set(selected).size !== selected.length;
  function submit(event) { event.preventDefault();const form = new FormData(event.currentTarget);startTransition(() => action(form)); }
  return <form method="post" onSubmit={submit} className="mt-5 space-y-5" aria-busy={pending}>
    <input type="hidden" name="challengeId" value={challengeId} /><input type="hidden" name="expectedVersion" value={expectedVersion} />
    {state.message && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm leading-7 text-red-900">{state.message}</p>}
    {state.refresh && <button type="button" onClick={() => window.location.reload()} className="inline-block text-sm font-semibold text-stone-800 underline underline-offset-4">Muat ulang pilihan</button>}
    <p className="text-sm leading-7 text-stone-600">Pilih minimal satu dan maksimal tiga karya. Satu karya hanya boleh mendapat satu peringkat. Pilihan yang disimpan langsung tampil sebagai pengumuman publik.</p>
    {[1, 2, 3].map((rank) => <div key={rank}><label htmlFor={"rank" + rank} className="block text-sm font-semibold">Juara {rank}</label><select id={"rank" + rank} name={"rank" + rank} value={choices["rank" + rank]} onChange={(event) => setChoices({ ...choices, ["rank" + rank]: event.target.value })} className="mt-2 w-full min-w-0 rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800" aria-invalid={Boolean(state.fields["rank" + rank])}><option value="">Belum dipilih</option>{candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.title} · {candidate.display_name}</option>)}</select>{state.fields["rank" + rank] && <p className="mt-2 text-sm text-red-800">{state.fields["rank" + rank]}</p>}</div>)}
    {duplicates && <p role="alert" className="text-sm text-red-800">Satu karya hanya boleh mendapat satu peringkat.</p>}
    <button disabled={pending || duplicates || !selected.length} className="rounded-lg bg-stone-800 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Menyimpan..." : winners.length ? "Perbarui pemenang" : "Umumkan pemenang"}</button>
  </form>;
}
