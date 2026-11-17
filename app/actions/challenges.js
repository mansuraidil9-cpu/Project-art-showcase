"use server";

import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session-token";
import { ChallengeError, createChallenge, updateChallenge, deleteChallenge, submitArtwork, withdrawSubmission, selectWinners } from "@/lib/challenges";
import { MemberError } from "@/lib/member";
import { UploadError, removeUploads } from "@/lib/uploads";
import { textField, parseId } from "@/lib/validation";

async function roleToken(role) { await requireUser({ roles: [role] }); return (await cookies()).get(SESSION_COOKIE)?.value; }
function failure(error, values = {}) {
  if (error instanceof ChallengeError || error instanceof MemberError || error instanceof UploadError) return { success: false, message: error.message, fields: error.fields, values };
  console.error("Perubahan challenge gagal:", error.code || "CHALLENGE_ERROR");
  return { success: false, message: "Perubahan belum dapat disimpan. Coba kembali.", fields: {}, values };
}
function saved(redirectTo) { return { success: true, message: "", fields: {}, values: {}, redirectTo }; }

export async function saveChallengeAction(previous, form) {
  const token = await roleToken("curator"), id = textField(form, "id");
  const values = Object.fromEntries(["title", "description", "rules", "prize", "startsAt", "endsAt"].map((name) => [name, textField(form, name)]));
  try {
    const result = id ? await updateChallenge(token, id, values, form.get("file")) : await createChallenge(token, values, form.get("file"));
    return saved("/challenges/" + result.id + "?notice=" + (result.cleanupFailed ? "updated-files" : id ? "updated" : "created"));
  } catch (error) { return failure(error, values); }
}

export async function deleteChallengeAction(previous, form) {
  const token = await roleToken("curator");
  let challenge;
  try { challenge = await deleteChallenge(token, textField(form, "id"), textField(form, "confirmation")); }
  catch (error) { return failure(error); }
  const failed = await removeUploads([challenge.banner_path]);
  return saved("/dashboard/curator?notice=" + (failed ? "deleted-files" : "deleted"));
}

export async function submitArtworkAction(previous, form) {
  const token = await roleToken("member"), artworkId = textField(form, "artworkId");
  try {
    const result = await submitArtwork(token, textField(form, "challengeId"), artworkId);
    return saved("/challenges/" + result.challengeId + "?notice=submitted#partisipasi");
  } catch (error) { return failure(error, { artworkId }); }
}

export async function withdrawSubmissionAction(previous, form) {
  const token = await roleToken("member");
  try {
    const result = await withdrawSubmission(token, textField(form, "challengeId"));
    if (textField(form, "returnTo") === "submissions") return saved("/dashboard/member/submissions?notice=withdrawn&page=" + (parseId(textField(form, "page")) || 1));
    return saved("/challenges/" + result.challengeId + "?notice=withdrawn#partisipasi");
  } catch (error) { return failure(error); }
}

export async function selectWinnersAction(previous, form) {
  const token = await roleToken("curator");
  const values = Object.fromEntries([1, 2, 3].map((rank) => ["rank" + rank, textField(form, "rank" + rank)]));
  const entries = [1, 2, 3].filter((rank) => values["rank" + rank] !== "").map((rank) => ({ rank, submissionId: values["rank" + rank] }));
  try {
    const result = await selectWinners(token, textField(form, "challengeId"), entries, textField(form, "expectedVersion"));
    return saved("/dashboard/curator/challenges/" + result.id + "/submissions?notice=winners-saved#pemenang");
  } catch (error) { return { ...failure(error, values), refresh: ["CONFLICT", "INVALID_SUBMISSION"].includes(error.code) }; }
}
