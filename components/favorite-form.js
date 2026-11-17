"use client";

import useActionForm from "@/components/use-action-form";
import { removeFavoriteAction } from "@/app/actions/member";

export default function RemoveFavoriteForm({ artworkId, page }) {
  const [state, action, pending] = useActionForm(removeFavoriteAction);
  return <form action={action} className="mt-4 space-y-3" aria-busy={pending}><input type="hidden" name="artworkId" value={artworkId} /><input type="hidden" name="page" value={page} />{state.message && <p role="alert" className="bg-red-50 p-3 text-sm leading-6 text-red-900">{state.message}</p>}<button disabled={pending} className="button-secondary disabled:opacity-60">{pending ? "Menghapus..." : "Hapus dari favorit"}</button></form>;
}
