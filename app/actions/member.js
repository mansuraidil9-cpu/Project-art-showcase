"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser, clearSessionCookie } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session-token";
import { MemberError } from "@/lib/member";
import { UploadError } from "@/lib/uploads";
import { setInteraction, addComment, deleteComment, reportArtwork } from "@/lib/interactions";
import { updateProfile, changeEmail, changePassword } from "@/lib/profile";
import { parseId, textField } from "@/lib/validation";

async function memberToken() {
  await requireUser({ roles: ["member"] });
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

function failure(error, values = {}) {
  if (error instanceof MemberError || error instanceof UploadError) return { success: false, message: error.message, fields: error.fields, values };
  console.error("Perubahan Member gagal:", error.code || "MEMBER_ERROR");
  return { success: false, message: "Perubahan belum dapat disimpan. Coba kembali.", fields: {}, values };
}
function saved(redirectTo) { return { success: true, message: "", fields: {}, values: {}, redirectTo }; }

export async function interactionAction(previous, form) {
  const token = await memberToken();
  try {
    const result = await setInteraction(token, textField(form, "artworkId"), textField(form, "kind"), textField(form, "enabled"));
    return saved("/artworks/" + result.artworkId + "?notice=interaction");
  } catch (error) { return failure(error); }
}
export async function removeFavoriteAction(previous, form) {
  const token = await memberToken();
  try { await setInteraction(token, textField(form, "artworkId"), "favorite", "no"); }
  catch (error) { return failure(error); }
  const page = parseId(textField(form, "page")) || 1;
  return saved("/dashboard/member/favorites?notice=removed&page=" + page);
}
export async function commentAction(previous, form) {
  const token = await memberToken();
  const body = textField(form, "body");
  try {
    const result = await addComment(token, textField(form, "artworkId"), body);
    return saved("/artworks/" + result.artworkId + "?notice=comment#comments-title");
  } catch (error) { return failure(error, { body: body.slice(0, 1000) }); }
}
export async function deleteCommentAction(previous, form) {
  const token = await memberToken();
  try {
    const result = await deleteComment(token, textField(form, "commentId"));
    return saved("/artworks/" + result.artworkId + "?notice=comment-deleted#comments-title");
  } catch (error) { return failure(error); }
}
export async function reportAction(previous, form) {
  const token = await memberToken();
  const reason = textField(form, "reason"), details = textField(form, "details");
  try {
    const result = await reportArtwork(token, textField(form, "artworkId"), reason, details);
    return saved("/artworks/" + result.artworkId + "?notice=reported");
  } catch (error) { return failure(error, { reason, details: details.slice(0, 1000) }); }
}
export async function profileAction(previous, form) {
  const token = await memberToken();
  const values = Object.fromEntries(["displayName", "bio", "website", "instagram", "behance"].map((name) => [name, textField(form, name)]));
  try {
    const result = await updateProfile(token, values, form.get("file"), textField(form, "removePhoto"));
    return saved("/dashboard/member/profile?notice=" + (result.cleanupFailed ? "updated-files" : "updated"));
  } catch (error) { return failure(error, values); }
}
export async function emailAction(previous, form) {
  const token = await memberToken();
  const email = textField(form, "email");
  try { await changeEmail(token, email, textField(form, "currentPassword")); }
  catch (error) { return failure(error, { email: email.slice(0, 254) }); }
  await clearSessionCookie();
  redirect("/login?account=email-updated");
}
export async function passwordAction(previous, form) {
  const token = await memberToken();
  try { await changePassword(token, textField(form, "currentPassword"), textField(form, "password"), textField(form, "confirmation")); }
  catch (error) { return failure(error); }
  await clearSessionCookie();
  redirect("/login?account=password-updated");
}
