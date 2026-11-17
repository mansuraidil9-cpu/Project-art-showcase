import "server-only";
import { query, withTransaction } from "./db.js";
import { getSessionUser } from "./session.js";
import { withMemberTransaction } from "./member.js";
import { pagination } from "./pagination.js";
import { parseId } from "./validation.js";
import { searchPattern } from "./artwork-rules.js";
import { parseWitaDate, formatWitaInput, challengeFilters } from "./challenge-rules.js";
import { saveChallengeImage, removeUploads } from "./uploads.js";

export class ChallengeError extends Error {
  constructor(code, message, fields = {}) { super(message); this.code = code; this.fields = fields; }
}

function validId(value) {
  const id = parseId(value);
  if (!id) throw new ChallengeError("INVALID_ID", "ID data tidak valid.");
  return id;
}

function withCuratorTransaction(token, callback) {
  return withTransaction(async (client) => {
    const user = await getSessionUser(token, client, true);
    if (!user) throw new ChallengeError("UNAUTHORIZED", "Sesi sudah berakhir. Silakan masuk kembali.");
    if (user.role !== "curator") throw new ChallengeError("FORBIDDEN", "Pengelolaan challenge hanya tersedia untuk Curator.");
    if (user.curator_status !== "approved") throw new ChallengeError("CURATOR_UNAPPROVED", "Akun Curator harus disetujui Admin terlebih dahulu.");
    return callback(client, user);
  });
}

function challengeInput(values) {
  const fields = {}, clean = {};
  for (const [name, label, maximum] of [["title", "Judul", 150], ["description", "Deskripsi", 5000], ["rules", "Aturan", 5000], ["prize", "Hadiah", 1000]]) {
    clean[name] = typeof values[name] === "string" ? values[name].trim() : "";
    if (!clean[name] || clean[name].length > maximum) fields[name] = label + " wajib diisi, maksimal " + maximum + " karakter.";
  }
  clean.startsAt = parseWitaDate(values.startsAt);clean.endsAt = parseWitaDate(values.endsAt);
  if (!clean.startsAt) fields.startsAt = "Isi tanggal dan waktu mulai yang valid dalam WITA.";
  if (!clean.endsAt) fields.endsAt = "Isi tanggal dan waktu selesai yang valid dalam WITA.";
  if (clean.startsAt && clean.endsAt && clean.endsAt <= clean.startsAt) fields.endsAt = "Waktu selesai harus setelah waktu mulai.";
  if (Object.keys(fields).length) throw new ChallengeError("VALIDATION", "Periksa kembali isian challenge.", fields);
  return clean;
}

async function ownedChallenge(client, value, userId) {
  const row = (await query("challengeOwnedLock", [validId(value), userId], client)).rows[0];
  if (!row) throw new ChallengeError("NOT_FOUND", "Challenge tidak ditemukan atau bukan milikmu.");
  return row;
}

export function getOwnedChallenge(token, value) {
  return withCuratorTransaction(token, async (client, user) => ownedChallenge(client, value, user.id));
}

export function getOwnChallenges(token, requestedPage = 1) {
  return withCuratorTransaction(token, async (client, user) => {
    const total = (await query("challengeOwnedCount", [user.id], client)).rows[0].total;
    const page = pagination(total, requestedPage, 6);
    return { ...page, challenges: (await query("challengeOwnedList", [user.id, 6, page.offset], client)).rows };
  });
}

export async function createChallenge(token, values, file) {
  let uploaded;
  try {
    return await withCuratorTransaction(token, async (client, user) => {
      const clean = challengeInput(values);
      uploaded = await saveChallengeImage(file);
      return (await query("challengeCreate", [user.id, clean.title, clean.description, clean.rules, clean.prize, clean.startsAt, clean.endsAt, uploaded], client)).rows[0];
    });
  } catch (error) { if (uploaded) await removeUploads([uploaded]); throw error; }
}

export async function updateChallenge(token, value, values, file = null) {
  let uploaded, result;
  try {
    result = await withCuratorTransaction(token, async (client, user) => {
      const old = await ownedChallenge(client, value, user.id), clean = challengeInput(values);
      // Input form memakai menit; simpan presisi lama jika jadwalnya tidak diubah.
      for (const [name, column] of [["startsAt", "starts_at"], ["endsAt", "ends_at"]]) {
        if (values[name] === formatWitaInput(old[column])) clean[name] = old[column];
        else if (old.has_winners) throw new ChallengeError("DATES_LOCKED", "Jadwal tidak bisa diubah setelah pemenang ditetapkan.", { [name]: "Jadwal challenge ini sudah dikunci." });
      }
      if (clean.endsAt <= clean.startsAt) throw new ChallengeError("VALIDATION", "Waktu selesai harus setelah waktu mulai.", { endsAt: "Waktu selesai harus setelah waktu mulai." });
      if (file && file.size > 0) uploaded = await saveChallengeImage(file);
      const row = (await query("challengeUpdate", [old.id, user.id, clean.title, clean.description, clean.rules, clean.prize, clean.startsAt, clean.endsAt, uploaded || old.banner_path], client)).rows[0];
      return { ...row, oldBanner: uploaded ? old.banner_path : null };
    });
  } catch (error) { if (uploaded) await removeUploads([uploaded]); throw error; }
  return { id: result.id, cleanupFailed: Boolean(await removeUploads([result.oldBanner])) };
}

export function deleteChallenge(token, value, confirmation) {
  return withCuratorTransaction(token, async (client, user) => {
    const old = await ownedChallenge(client, value, user.id);
    if (confirmation !== "yes") throw new ChallengeError("CONFIRMATION", "Centang konfirmasi sebelum menghapus challenge.");
    await query("challengeDelete", [old.id, user.id], client);
    return old;
  });
}

export async function getChallenges({ pageSize = 6, ...params } = {}) {
  const filters = challengeFilters(params);
  if (filters.error) throw new ChallengeError("VALIDATION", filters.error);
  const size = Number.isInteger(pageSize) && pageSize > 0 && pageSize <= 12 ? pageSize : 6;
  const values = [searchPattern(filters.q), filters.status];
  const total = (await query("challengeCount", values)).rows[0].total;
  const page = pagination(total, filters.page, size);
  return { ...page, challenges: (await query("challengeList", [...values, size, page.offset])).rows };
}

export async function getChallenge(value, requestedPage = 1) {
  const id = validId(value), challenge = (await query("challengeDetail", [id])).rows[0];
  if (!challenge) throw new ChallengeError("NOT_FOUND", "Challenge sudah dihapus atau tidak ditemukan.");
  const total = (await query("challengeSubmissionsCount", [id])).rows[0].total;
  const gallery = pagination(total, requestedPage, 12);
  const winners = (await query("winnersPublic", [id])).rows;
  return { challenge, winners, gallery: { ...gallery, artworks: (await query("challengeSubmissionsGallery", [id, 12, gallery.offset])).rows } };
}

export function getParticipation(token, value) {
  return withMemberTransaction(token, async (client, user) => {
    const id = validId(value);
    return { submission: (await query("challengeOwnSubmission", [id, user.id], client)).rows[0] || null,
      artworks: (await query("challengeArtworkOptions", [user.id], client)).rows };
  });
}

async function lockChallenge(client, value) {
  const row = (await query("challengeLock", [validId(value)], client)).rows[0];
  if (!row) throw new ChallengeError("NOT_FOUND", "Challenge sudah dihapus atau tidak tersedia.");
  return row;
}

export function submitArtwork(token, value, artworkValue) {
  return withMemberTransaction(token, async (client, user) => {
    const artworkId = validId(artworkValue);
    // Urutan kunci karya lalu challenge juga aman saat karya dihapus melalui moderasi.
    if (!(await query("artworkOwnedLock", [artworkId, user.id], client)).rowCount) throw new ChallengeError("ARTWORK_NOT_OWNED", "Pilih karya dari portofoliomu sendiri.", { artworkId: "Karya tidak ditemukan atau bukan milikmu." });
    const challenge = await lockChallenge(client, value);
    const window = (await query("challengeWindow", [challenge.id], client)).rows[0];
    if (!window.started || !window.open) throw new ChallengeError("NOT_ACTIVE", "Submisi hanya dapat dikirim saat challenge sedang berlangsung.");
    if ((await query("challengeOwnSubmission", [challenge.id, user.id], client)).rowCount) throw new ChallengeError("ALREADY_SUBMITTED", "Kamu sudah mengirim satu karya. Tarik submisi terlebih dahulu jika ingin menggantinya.");
    const inserted = await query("challengeSubmit", [challenge.id, user.id, artworkId], client);
    if (!inserted.rowCount) throw new ChallengeError("NOT_ACTIVE", "Waktu challenge telah berakhir atau submisi sudah tercatat. Muat ulang halaman.");
    return { challengeId: challenge.id, id: inserted.rows[0].id };
  });
}

export function withdrawSubmission(token, value) {
  return withMemberTransaction(token, async (client, user) => {
    const challenge = await lockChallenge(client, value);
    if (!(await query("challengeWindow", [challenge.id], client)).rows[0].open) throw new ChallengeError("ENDED", "Challenge sudah berakhir. Submisi tidak dapat ditarik.");
    if (!(await query("challengeOwnSubmission", [challenge.id, user.id], client)).rowCount) throw new ChallengeError("NOT_FOUND", "Tidak ada submisi milikmu pada challenge ini.");
    const removed = await query("challengeWithdraw", [challenge.id, user.id], client);
    if (!removed.rowCount) throw new ChallengeError("ENDED", "Batas waktu sudah terlewat. Submisi tidak dapat ditarik.");
    return { challengeId: challenge.id };
  });
}

function winnerVersion(rows) {
  return [...rows].sort((a, b) => a.rank - b.rank).map((row) => row.rank + ":" + row.submission_id).join("|");
}

function winnerInput(entries) {
  if (!Array.isArray(entries) || entries.length < 1 || entries.length > 3) throw new ChallengeError("VALIDATION", "Pilih 1–3 pemenang sebelum menyimpan pengumuman.");
  const ranks = new Set(), submissions = new Set(), fields = {}, selected = [];
  for (const entry of entries) {
    const rank = Number(entry?.rank), submissionId = parseId(entry?.submissionId);
    if (!/^[1-3]$/.test(String(entry?.rank)) || ranks.has(rank)) throw new ChallengeError("VALIDATION", "Setiap peringkat harus berupa Juara 1, 2, atau 3 dan hanya boleh dipakai sekali.");
    if (!submissionId) fields["rank" + rank] = "Pilih submisi yang valid.";
    else if (submissions.has(submissionId)) fields["rank" + rank] = "Satu karya hanya boleh mendapat satu peringkat.";
    ranks.add(rank);submissions.add(submissionId);selected.push({ rank, submissionId });
  }
  if (Object.keys(fields).length) throw new ChallengeError("VALIDATION", "Periksa kembali pilihan pemenang.", fields);
  return selected.sort((a, b) => a.rank - b.rank);
}

export function getChallengeManagement(token, value, requestedPage = 1) {
  return withCuratorTransaction(token, async (client, user) => {
    const challenge = await ownedChallenge(client, value, user.id);
    const total = (await query("challengeSubmissionsCount", [challenge.id], client)).rows[0].total;
    const gallery = pagination(total, requestedPage, 12);
    const artworks = (await query("challengeManagementGallery", [challenge.id, 12, gallery.offset], client)).rows;
    const candidates = (await query("winnerCandidates", [challenge.id], client)).rows;
    const winners = (await query("winnerCurrent", [challenge.id], client)).rows;
    const ended = (await query("winnerWindow", [challenge.id], client)).rows[0].ended;
    return { challenge, ended, candidates, winners, expectedVersion: winnerVersion(winners), gallery: { ...gallery, artworks } };
  });
}

export function selectWinners(token, value, entries, expectedVersion) {
  return withCuratorTransaction(token, async (client, user) => {
    const id = validId(value), selected = winnerInput(entries);
    if (!(await query("winnerOwner", [id, user.id], client)).rowCount) throw new ChallengeError("NOT_FOUND", "Challenge tidak ditemukan atau bukan milikmu.");
    const submissionIds = selected.map((entry) => entry.submissionId);
    // Kunci karya sebelum challenge agar aman terhadap penghapusan karya oleh Admin.
    await query("winnerArtworkLocks", [id, submissionIds], client);
    await ownedChallenge(client, id, user.id);
    if (!(await query("winnerWindow", [id], client)).rows[0].ended) throw new ChallengeError("NOT_ENDED", "Pemenang hanya dapat dipilih setelah challenge berakhir.");
    const current = (await query("winnerCurrent", [id], client)).rows;
    if (typeof expectedVersion !== "string" || expectedVersion !== winnerVersion(current)) throw new ChallengeError("CONFLICT", "Pilihan pemenang sudah berubah. Muat ulang halaman sebelum menyimpan.");
    const candidates = await query("winnerSubmissionLocks", [id, submissionIds], client);
    if (candidates.rowCount !== selected.length) throw new ChallengeError("INVALID_SUBMISSION", "Sebagian submisi tidak tersedia atau berasal dari challenge lain. Muat ulang daftar.");
    const nextVersion = winnerVersion(selected.map((entry) => ({ rank: entry.rank, submission_id: entry.submissionId })));
    if (nextVersion === winnerVersion(current)) return { id };
    await query("winnerClear", [id], client);
    for (const entry of selected) {
      if (!(await query("winnerInsert", [id, entry.submissionId, entry.rank], client)).rowCount) throw new ChallengeError("NOT_ENDED", "Jadwal challenge berubah. Pengumuman belum disimpan.");
    }
    return { id };
  });
}

export async function getFeaturedWinners() {
  return (await query("featuredWinners", [3])).rows;
}
