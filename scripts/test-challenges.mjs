import nextEnv from "@next/env";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import { randomBytes } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";

nextEnv.loadEnvConfig(process.cwd());
const { query, withTransaction } = await import("../lib/db.js");
const { createSession, decodeSession } = await import("../lib/session.js");
const { verifyCurator } = await import("../lib/admin.js");
const { createChallenge, updateChallenge, deleteChallenge, getOwnChallenges, getOwnedChallenge, getChallenges, getChallenge, getParticipation, submitArtwork, withdrawSubmission } = await import("../lib/challenges.js");
const { formatWitaInput, parseWitaDate } = await import("../lib/challenge-rules.js");
const { removeUploads } = await import("../lib/uploads.js");
const sql = {};
for (const name of ["cleanup", "files", "dates", "deadline", "lock-waits", "clock-passed", "related", "opening", "submitted-time"]) sql[name] = await readFile(new URL("../database/tests/challenge-" + name + ".sql", import.meta.url), "utf8");
for (const name of ["submission-create", "winner-create"]) sql[name] = await readFile(new URL("../database/tests/admin-" + name + ".sql", import.meta.url), "utf8");
sql.artwork = await readFile(new URL("../database/tests/moderation-artwork.sql", import.meta.url), "utf8");
sql.status = await readFile(new URL("../database/tests/auth-status.sql", import.meta.url), "utf8");
const marker = randomBytes(6).toString("hex"), users = [], uploads = [];
const hash = await bcrypt.hash("UjiChallenge2026!", 12);
const png = await sharp({ create: { width: 600, height: 300, channels: 3, background: "#ad7355" } }).png().toBuffer();
const banner = () => new File([png], "banner.png", { type: "image/png" });
const fails = (promise, code) => assert.rejects(promise, (error) => error.code === code);
const run = (name, values) => withTransaction((client) => client.query(sql[name], values));
const days = (value) => formatWitaInput(Date.now() + value * 86400000);
let category;
async function account(label, role) {
  const email = "uji-challenge-" + marker + "-" + label + "@example.test";
  const user = await withTransaction(async (client) => { const created = (await query("userCreate", [email, hash, "Pengguna " + label + " " + marker, role], client)).rows[0];return { ...created, email, token: (await createSession(created, client)).token }; });
  users.push(user);return user;
}
async function make(token, values) { const row = await createChallenge(token, values, banner());uploads.push(row.banner_path);return row; }
async function until(predicate) { for (let i = 0; i < 160; i++) { if (await predicate()) return;await new Promise((resolve) => setTimeout(resolve, 25)); }throw new Error("Kondisi antrean/waktu pengujian tidak tercapai"); }
async function pastDeadline(curator, challengeId, operation, expected) {
  const blocker = await globalThis.artShowcasePool.connect();let pending;
  try {
    await blocker.query("BEGIN");await query("challengeOwnedLock", [challengeId, curator.id], blocker);
    const endsAt = (await blocker.query(sql.deadline, [challengeId, "2 seconds"])).rows[0].ends_at;
    pending = operation();pending.catch(() => {});
    await until(async () => (await run("lock-waits", [])).rows[0].total > 0);
    await until(async () => (await run("clock-passed", [endsAt])).rows[0].passed);
    await blocker.query("COMMIT");await fails(pending, expected);
  } finally { await blocker.query("ROLLBACK");blocker.release();if (pending) await Promise.allSettled([pending]); }
}
try {
  assert.equal(parseWitaDate("2026-11-21T09:30").toISOString(), "2026-11-21T01:30:00.000Z");
  for (const date of ["2026-02-30T09:30", "2026-13-01T09:00", "2026-01-01T24:00", "2026-01-01T09:00Z", "", null]) assert.equal(parseWitaDate(date), null);
  const admin = await account("admin", "admin"), curator = await account("kurator", "curator"), otherCurator = await account("kurator-lain", "curator"), pending = await account("pending", "curator"), rejected = await account("ditolak", "curator");
  const member = await account("member", "member"), other = await account("member-lain", "member"), empty = await account("member-kosong", "member");
  for (const user of [curator, otherCurator]) await verifyCurator(admin.token, user.id, "approved", "");
  await verifyCurator(admin.token, rejected.id, "rejected", "Identitas belum lengkap.");
  const values = { title: "Warna 50%_ " + marker, description: "Ceritakan pesisir dari sudut pandangmu.", rules: "Karya orisinal dari portofolio sendiri.", prize: "Ulasan portofolio bersama komunitas.", startsAt: days(-1), endsAt: days(1) };
  for (const [token, code] of [[member.token, "FORBIDDEN"], [admin.token, "FORBIDDEN"], [pending.token, "CURATOR_UNAPPROVED"], [rejected.token, "CURATOR_UNAPPROVED"], ["palsu", "UNAUTHORIZED"]]) { await fails(createChallenge(token, values, banner()), code);await fails(getOwnChallenges(token), code); }
  for (const extra of [{ title: " " }, { description: " " }, { rules: "" }, { prize: "" }, { endsAt: values.startsAt }, { startsAt: "2026-02-30T09:30" }, { endsAt: "2026-01-01T09:00Z" }]) await fails(createChallenge(curator.token, { ...values, ...extra }, banner()), "VALIDATION");
  await fails(createChallenge(curator.token, values, null), "INVALID_FILE");
  await fails(createChallenge(curator.token, values, new File([Buffer.alloc(5 * 1024 * 1024 + 1)], "besar.png", { type: "image/png" })), "FILE_TOO_LARGE");
  await fails(createChallenge(curator.token, values, new File(["<script>alert(1)</script>"], "palsu.png", { type: "image/png" })), "INVALID_IMAGE");
  const before = await readdir(new URL("../public/uploads/", import.meta.url));
  await assert.rejects(createChallenge(curator.token, { ...values, description: "gagal\0simpan" }, banner()));
  assert.deepEqual((await readdir(new URL("../public/uploads/", import.meta.url))).sort(), before.sort());
  const active = await make(curator.token, { ...values, curator_id: otherCurator.id }), future = await make(curator.token, { ...values, title: "Mendatang " + marker, startsAt: days(1), endsAt: days(2) }), ended = await make(curator.token, { ...values, title: "Selesai " + marker, startsAt: days(-2), endsAt: days(-1) });
  const otherChallenge = await make(otherCurator.token, { ...values, title: "Kurator lain " + marker });
  assert.equal((await getOwnedChallenge(curator.token, active.id)).curator_id, curator.id);
  assert.equal((await getOwnChallenges(curator.token)).total, 3);assert.equal((await getOwnChallenges(otherCurator.token)).total, 1);
  for (const operation of [() => updateChallenge(otherCurator.token, active.id, values), () => deleteChallenge(otherCurator.token, active.id, "yes"), () => getOwnedChallenge(otherCurator.token, active.id)]) await fails(operation(), "NOT_FOUND");
  await fails(deleteChallenge(curator.token, active.id, ""), "CONFIRMATION");
  await fails(getOwnedChallenge(curator.token, "1 OR 1=1"), "INVALID_ID");
  await run("status", [curator.email, "pending", null]);await fails(updateChallenge(curator.token, active.id, values), "CURATOR_UNAPPROVED");await run("status", [curator.email, "approved", null]);
  console.log("Lulus: waktu WITA, seluruh isian wajib, banner, rollback file, role/status Curator terkini, dan kepemilikan challenge.");

  await updateChallenge(curator.token, active.id, { ...values, title: "Diperbarui " + marker });
  assert.equal((await getOwnedChallenge(curator.token, active.id)).banner_path, active.banner_path);
  await updateChallenge(curator.token, active.id, values, banner());
  const updated = await getOwnedChallenge(curator.token, active.id);uploads.push(updated.banner_path);
  await assert.rejects(stat(new URL("../public" + active.banner_path, import.meta.url)), (error) => error.code === "ENOENT");
  const currentFiles = await readdir(new URL("../public/uploads/", import.meta.url));
  await assert.rejects(updateChallenge(curator.token, active.id, { ...values, rules: "gagal\0simpan" }, banner()));
  assert.deepEqual((await readdir(new URL("../public/uploads/", import.meta.url))).sort(), currentFiles.sort());
  assert.equal((await getOwnedChallenge(curator.token, active.id)).banner_path, updated.banner_path);
  assert.equal((await getChallenges({ q: marker, status: "active" })).total, 2);
  assert.equal((await getChallenges({ q: marker, status: "upcoming" })).total, 1);assert.equal((await getChallenges({ q: marker, status: "ended" })).total, 1);
  assert.equal((await getChallenges({ q: "%_", status: "all" })).total, 1);
  assert.equal((await getChallenges({ q: "' OR 1=1--" })).total, 0);
  await fails(getChallenges({ status: "active' OR 1=1" }), "VALIDATION");
  const firstPage = await getChallenges({ q: marker, pageSize: 1 }), nextPage = await getChallenges({ q: marker, pageSize: 1, page: 2 });assert.notEqual(firstPage.challenges[0].id, nextPage.challenges[0].id);
  assert.equal((await getChallenge(active.id)).challenge.status, "active");assert.equal((await getChallenge(future.id)).challenge.status, "upcoming");assert.equal((await getChallenge(ended.id)).challenge.status, "ended");
  assert.equal(Object.hasOwn((await getChallenge(active.id)).challenge, "email"), false);
  console.log("Lulus: edit/banner pengganti, pembersihan berkas lama, pencarian literal, filter status, dan paginasi publik.");

  category = (await query("categoryCreate", ["Kategori challenge " + marker, "Kategori sementara."])).rows[0];
  const works = [];
  for (const user of [member, member, other]) works.push((await run("artwork", [user.id, category.id, "Karya peserta " + works.length, "/examples/art-01.svg", "image/svg+xml"])).rows[0]);
  for (const token of [curator.token, admin.token, pending.token]) { await fails(submitArtwork(token, active.id, works[0].id), "FORBIDDEN");await fails(withdrawSubmission(token, active.id), "FORBIDDEN"); }
  await fails(submitArtwork("palsu", active.id, works[0].id), "UNAUTHORIZED");
  await fails(submitArtwork(member.token, active.id, works[2].id), "ARTWORK_NOT_OWNED");
  await fails(submitArtwork(member.token, future.id, works[0].id), "NOT_ACTIVE");await fails(submitArtwork(member.token, ended.id, works[0].id), "NOT_ACTIVE");
  const race = await Promise.allSettled([submitArtwork(member.token, active.id, works[0].id), submitArtwork(member.token, active.id, works[1].id)]);
  assert.equal(race.filter((result) => result.status === "fulfilled").length, 1);assert.equal(race.find((result) => result.status === "rejected").reason.code, "ALREADY_SUBMITTED");
  await assert.rejects(run("submission-create", [active.id, member.id, works[1].id]), (error) => error.code === "23505");
  await assert.rejects(run("submission-create", [active.id, empty.id, works[0].id]), (error) => error.code === "23503");
  await submitArtwork(other.token, active.id, works[2].id);await submitArtwork(member.token, otherChallenge.id, works[0].id);
  assert.equal((await getChallenge(active.id)).gallery.total, 2);assert.equal((await getParticipation(member.token, active.id)).artworks.length, 2);assert.equal((await getParticipation(empty.token, active.id)).artworks.length, 0);
  await withdrawSubmission(member.token, active.id);await fails(withdrawSubmission(member.token, active.id), "NOT_FOUND");assert((await getParticipation(other.token, active.id)).submission);
  await run("dates", [active.id, parseWitaDate(days(1)), parseWitaDate(days(2))]);await withdrawSubmission(other.token, active.id);
  await run("dates", [active.id, parseWitaDate(days(-1)), parseWitaDate(days(1))]);await submitArtwork(member.token, active.id, works[0].id);
  await run("dates", [active.id, parseWitaDate(days(-2)), new Date(Date.now() - 1000)]);await fails(withdrawSubmission(member.token, active.id), "ENDED");assert((await getParticipation(member.token, active.id)).submission);
  console.log("Lulus: submit hanya saat aktif, satu karya per Member, foreign key kepemilikan, withdraw sebelum berakhir, dan galeri submisi.");

  const submission = (await getParticipation(member.token, active.id)).submission;
  await run("winner-create", [active.id, submission.id, 1]);
  const locked = await getOwnedChallenge(curator.token, active.id), lockedValues = { ...values, startsAt: formatWitaInput(locked.starts_at), endsAt: formatWitaInput(locked.ends_at) };
  await updateChallenge(curator.token, active.id, { ...lockedValues, description: "Cerita baru, jadwal tetap." });
  assert.equal((await getOwnedChallenge(curator.token, active.id)).ends_at.getTime(), locked.ends_at.getTime());
  await fails(updateChallenge(curator.token, active.id, { ...lockedValues, endsAt: days(3) }), "DATES_LOCKED");
  const removed = await deleteChallenge(curator.token, active.id, "yes");await removeUploads([removed.banner_path]);
  assert.deepEqual((await run("related", [active.id, works[0].id])).rows[0], { challenges: 0, submissions: 0, winners: 0, original_artwork: 1 });
  await fails(getChallenge(active.id), "NOT_FOUND");
  await pastDeadline(otherCurator, otherChallenge.id, () => submitArtwork(other.token, otherChallenge.id, works[2].id), "NOT_ACTIVE");
  await run("dates", [otherChallenge.id, parseWitaDate(days(-1)), parseWitaDate(days(1))]);
  await pastDeadline(otherCurator, otherChallenge.id, () => withdrawSubmission(member.token, otherChallenge.id), "ENDED");
  assert((await getParticipation(member.token, otherChallenge.id)).submission);
  const blocker = await globalThis.artShowcasePool.connect();let waitingSubmit;
  try {
    await blocker.query("BEGIN");await query("challengeOwnedLock", [otherChallenge.id, otherCurator.id], blocker);
    const startsAt = (await blocker.query(sql.opening, [otherChallenge.id])).rows[0].starts_at;
    waitingSubmit = submitArtwork(other.token, otherChallenge.id, works[2].id);waitingSubmit.catch(() => {});
    await until(async () => (await run("lock-waits", [])).rows[0].total > 0);
    await until(async () => (await run("clock-passed", [startsAt])).rows[0].passed);
    await blocker.query("COMMIT");const accepted = await waitingSubmit;
    assert((await run("submitted-time", [accepted.id])).rows[0].created_at >= startsAt);
  } finally { await blocker.query("ROLLBACK");blocker.release();if (waitingSubmit) await Promise.allSettled([waitingSubmit]); }
  const session = await decodeSession(curator.token);await query("sessionDelete", [session.hash]);await fails(getOwnChallenges(curator.token), "UNAUTHORIZED");
  console.log("Lulus: jadwal pemenang terkunci, CASCADE tanpa menghapus karya asli, antrean deadline, dan waktu submisi dicatat saat diterima.");
} finally {
  if (globalThis.artShowcasePool) {
    for (const user of users) uploads.push(...(await run("files", [user.id])).rows.map((row) => row.banner_path));
    await withTransaction(async (client) => { for (const user of users) await client.query(sql.cleanup, [user.id]);if (category) await query("categoryDelete", [category.id], client); });
    await globalThis.artShowcasePool.end();
  }
  await removeUploads(uploads);
}
