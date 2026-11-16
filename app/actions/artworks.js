"use server";

import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session-token";
import { ArtworkError, createArtwork, updateArtwork, deleteArtwork } from "@/lib/artworks";
import { UploadError, removeUploads } from "@/lib/uploads";
import { textField } from "@/lib/validation";

async function memberToken() {
  await requireUser({ roles: ["member"] });
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

function actionError(error, values = {}) {
  if (error instanceof ArtworkError || error instanceof UploadError) {
    return { success: false, message: error.message, fields: error.fields, values };
  }
  console.error("Perubahan karya gagal:", error.code || "ARTWORK_ERROR");
  return { success: false, message: "Perubahan karya belum dapat disimpan. Coba kembali.", fields: {}, values };
}

export async function saveArtworkAction(previous, form) {
  const token = await memberToken();
  const id = textField(form, "id");
  const values = { title: textField(form, "title"), description: textField(form, "description"), categoryId: textField(form, "categoryId"), tags: textField(form, "tags") };
  let artwork;
  try {
    artwork = id ? await updateArtwork(token, id, values, form.get("file")) : await createArtwork(token, values, form.get("file"));
  } catch (error) { return actionError(error, values); }
  return { success: true, message: "", fields: {}, values: {}, redirectTo: "/artworks/" + artwork.id + "?notice=" + (id ? "updated" : "created") };
}

export async function deleteArtworkAction(previous, form) {
  const token = await memberToken();
  let artwork;
  try { artwork = await deleteArtwork(token, textField(form, "id"), textField(form, "confirmation")); }
  catch (error) { return actionError(error); }
  const failed = await removeUploads([artwork.file_path]);
  return { success: true, message: "", fields: {}, values: {}, redirectTo: "/dashboard/member/artworks?notice=" + (failed ? "deleted-files" : "deleted") };
}
