import "server-only";
import { query } from "./db.js";
import { MemberError, withMemberTransaction } from "./member.js";
import { parseId } from "./validation.js";
import { REPORT_REASONS } from "./interaction-rules.js";

function validId(value) {
  const id = parseId(value);
  if (!id) throw new MemberError("INVALID_ID", "ID data tidak valid.");
  return id;
}

async function lockArtwork(client, value) {
  const id = validId(value);
  const artwork = (await query("interactionArtworkLock", [id], client)).rows[0];
  if (!artwork) throw new MemberError("NOT_FOUND", "Karya sudah dihapus atau tidak ditemukan.");
  return artwork;
}

export async function setInteraction(token, value, kind, enabled) {
  return withMemberTransaction(token, async (client, user) => {
    const choices = { like: ["likeRemove", "likeAdd"], favorite: ["favoriteRemove", "favoriteAdd"] };
    if (!Object.hasOwn(choices, kind) || !["yes", "no"].includes(enabled)) {
      throw new MemberError("VALIDATION", "Pilihan interaksi tidak valid.");
    }
    const artwork = await lockArtwork(client, value);
    await query(choices[kind][enabled === "yes" ? 1 : 0], [user.id, artwork.id], client);
    return { artworkId: artwork.id };
  });
}

export async function addComment(token, value, text) {
  return withMemberTransaction(token, async (client, user) => {
    const body = typeof text === "string" ? text.trim() : "";
    if (!body || body.length > 1000) throw new MemberError("VALIDATION", "Komentar wajib diisi, maksimal 1.000 karakter.", { body: "Tulis komentar sepanjang 1–1.000 karakter." });
    const artwork = await lockArtwork(client, value);
    const comment = (await query("commentCreate", [user.id, artwork.id, body], client)).rows[0];
    return { id: comment.id, artworkId: artwork.id };
  });
}

export async function deleteComment(token, value) {
  return withMemberTransaction(token, async (client, user) => {
    const id = validId(value);
    const comment = (await query("commentOwnedLock", [id, user.id], client)).rows[0];
    if (!comment) throw new MemberError("NOT_FOUND", "Komentar tidak ditemukan atau bukan milikmu.");
    await query("commentDelete", [id, user.id], client);
    return { artworkId: comment.artwork_id };
  });
}

export async function reportArtwork(token, value, reason, text) {
  return withMemberTransaction(token, async (client, user) => {
    const fields = {};
    const details = typeof text === "string" ? text.trim() : "";
    if (!REPORT_REASONS.includes(reason)) fields.reason = "Pilih alasan laporan yang tersedia.";
    if (details.length < 10 || details.length > 1000) fields.details = "Penjelasan laporan harus 10–1.000 karakter.";
    if (Object.keys(fields).length) throw new MemberError("VALIDATION", "Periksa kembali laporanmu.", fields);
    const artwork = await lockArtwork(client, value);
    if (artwork.member_id === user.id) throw new MemberError("SELF_REPORT", "Kamu tidak dapat melaporkan karya sendiri.");
    const result = await query("reportCreate", [user.id, artwork.id, reason, details], client);
    if (!result.rowCount) throw new MemberError("ALREADY_REPORTED", "Kamu sudah melaporkan karya ini. Satu karya hanya dapat dilaporkan sekali oleh Member yang sama.");
    return { artworkId: artwork.id };
  });
}
