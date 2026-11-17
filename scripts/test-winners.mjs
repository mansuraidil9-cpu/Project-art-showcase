import nextEnv from "@next/env";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";

nextEnv.loadEnvConfig(process.cwd());
const { query, withTransaction } = await import("../lib/db.js");
const { createSession, decodeSession } = await import("../lib/session.js");
const { verifyCurator, takeDownArtwork } = await import("../lib/admin.js");
const { getChallengeManagement, selectWinners, getChallenge, getFeaturedWinners } = await import("../lib/challenges.js");
const { getMySubmissions, getMemberOverview } = await import("../lib/dashboard.js");
const { reportArtwork } = await import("../lib/interactions.js");
const sql = {};
for (const [name, file] of Object.entries({ cleanup: "winner-cleanup", submission: "winner-submission", waits: "winner-lock-waits", artwork: "moderation-artwork", status: "auth-status", deadline: "challenge-deadline", passed: "challenge-clock-passed", dates: "challenge-dates", rawWinner: "admin-winner-create" })) sql[name] = await readFile(new URL("../database/tests/" + file + ".sql", import.meta.url), "utf8");
const marker = randomBytes(6).toString("hex"), users = [], hash = await bcrypt.hash("UjiPemenang2026!", 12);
let category;
const fails = (promise, code) => assert.rejects(promise, (error) => error.code === code);
const run = (name, values) => withTransaction((client) => client.query(sql[name], values));
async function account(label, role) {
  const email = "uji-winner-" + marker + "-" + label + "@example.test";
  const user = await withTransaction(async (client) => { const created = (await query("userCreate", [email, hash, "Pengguna Uji " + label, role], client)).rows[0];return { ...created, email, token: (await createSession(created, client)).token }; });users.push(user);return user;
}
async function challenge(curator, label, state = "ended") {
  const start = new Date(Date.now() + (state === "upcoming" ? 1 : -2) * 86400000), end = new Date(Date.now() + (state === "ended" ? -1 : 2) * 86400000);
  return (await query("challengeCreate", [curator.id, label + " " + marker, "Cerita untuk pengujian pemenang.", "Karya orisinal.", "Ulasan portofolio.", start, end, "/examples/art-01.svg"])).rows[0];
}
async function artwork(member, label) { return (await run("artwork", [member.id, category.id, label + " " + marker, "/examples/art-02.svg", "image/svg+xml"])).rows[0]; }
async function submission(challenge, member, artwork) { return (await run("submission", [challenge.id, member.id, artwork.id])).rows[0]; }
async function until(predicate) { for (let i = 0; i < 160; i++) { if (await predicate()) return;await new Promise((resolve) => setTimeout(resolve, 25)); }throw new Error("Antrean waktu pengujian tidak tercapai"); }
try {
  const admin = await account("admin", "admin"), curator = await account("curator", "curator"), otherCurator = await account("curator-lain", "curator"), pending = await account("pending", "curator"), rejected = await account("ditolak", "curator");
  for (const user of [curator, otherCurator]) await verifyCurator(admin.token, user.id, "approved", "");await verifyCurator(admin.token, rejected.id, "rejected", "Identitas belum lengkap.");
  const members = [];for (let i = 0; i < 4; i++) members.push(await account("member-" + i, "member"));
  category = (await query("categoryCreate", ["Kategori pemenang " + marker, "Data sementara pengujian."])).rows[0];
  const works = [];for (let i = 0; i < members.length; i++) works.push(await artwork(members[i], "Studi Pesisir " + i));
  const ended = await challenge(curator, "Pengumuman pesisir"), active = await challenge(curator, "Sedang berjalan", "active"), upcoming = await challenge(curator, "Mendatang", "upcoming"), foreign = await challenge(otherCurator, "Milik Curator lain"), empty = await challenge(curator, "Tanpa peserta");
  const entries = [];for (let i = 0; i < members.length; i++) entries.push(await submission(ended, members[i], works[i]));
  const foreignSubmission = await submission(foreign, members[0], works[0]), activeSubmission = await submission(active, members[0], works[0]);
  const data = await getChallengeManagement(curator.token, ended.id);assert.equal(data.gallery.total, 4);assert.equal(data.candidates.length, 4);assert.equal(data.expectedVersion, "");assert(data.ended);
  assert.equal((await getChallengeManagement(curator.token, empty.id)).candidates.length, 0);assert.equal((await getChallenge(ended.id)).winners.length, 0);
  for (const [token, code] of [[admin.token, "FORBIDDEN"], [members[0].token, "FORBIDDEN"], [pending.token, "CURATOR_UNAPPROVED"], [rejected.token, "CURATOR_UNAPPROVED"], ["palsu", "UNAUTHORIZED"]]) {
    await fails(getChallengeManagement(token, ended.id), code);await fails(selectWinners(token, ended.id, [{ rank: 1, submissionId: entries[0].id }], ""), code);
  }
  await fails(getChallengeManagement(otherCurator.token, ended.id), "NOT_FOUND");await fails(selectWinners(otherCurator.token, ended.id, [{ rank: 1, submissionId: entries[0].id }], ""), "NOT_FOUND");
  await fails(getChallengeManagement(curator.token, "1 OR 1=1"), "INVALID_ID");
  await run("status", [curator.email, "pending", null]);await fails(selectWinners(curator.token, ended.id, [{ rank: 1, submissionId: entries[0].id }], ""), "CURATOR_UNAPPROVED");await run("status", [curator.email, "approved", null]);
  for (const challenge of [active, upcoming]) await fails(selectWinners(curator.token, challenge.id, [{ rank: 1, submissionId: entries[0].id }], ""), "NOT_ENDED");
  for (const invalid of [[], Array.from({ length: 4 }, (_, index) => ({ rank: index + 1, submissionId: entries[index].id })), [{ rank: 4, submissionId: entries[0].id }], [{ rank: 1, submissionId: entries[0].id }, { rank: 1, submissionId: entries[1].id }], [{ rank: 1, submissionId: entries[0].id }, { rank: 2, submissionId: entries[0].id }], [{ rank: 1, submissionId: "1 OR 1=1" }]]) await fails(selectWinners(curator.token, ended.id, invalid, ""), "VALIDATION");
  await fails(selectWinners(curator.token, ended.id, [{ rank: 1, submissionId: foreignSubmission.id }], ""), "INVALID_SUBMISSION");
  await fails(selectWinners(curator.token, ended.id, [{ rank: 1, submissionId: 2147483647 }], ""), "INVALID_SUBMISSION");
  console.log("Lulus: role/status, kepemilikan challenge, waktu berakhir, maksimal tiga, serta peringkat/karya unik dan kandidat yang sesuai.");

  const selected = entries.slice(0, 3).map((entry, index) => ({ rank: index + 1, submissionId: entry.id }));
  await selectWinners(curator.token, ended.id, selected, "");
  const published = await getChallenge(ended.id);assert.deepEqual(published.winners.map((winner) => winner.rank), [1, 2, 3]);assert(published.winners.every((winner) => winner.awarded_at > published.challenge.ends_at));assert.equal(Object.hasOwn(published.winners[0], "email"), false);
  assert.equal((await getMySubmissions(members[0].token)).artworks.find((entry) => entry.challenge_id === ended.id).rank, 1);
  assert.equal((await getMySubmissions(members[3].token)).artworks.find((entry) => entry.challenge_id === ended.id).has_winners, true);
  const before = await getChallengeManagement(curator.token, ended.id);
  await selectWinners(curator.token, ended.id, selected, before.expectedVersion);assert.deepEqual((await getChallengeManagement(curator.token, ended.id)).winners, before.winners);
  await fails(selectWinners(curator.token, ended.id, [{ rank: 1, submissionId: entries[3].id }], ""), "CONFLICT");
  await assert.rejects(withTransaction(async (client) => { await query("winnerClear", [ended.id], client);await query("winnerInsert", [ended.id, entries[0].id, 1], client);await query("winnerInsert", [ended.id, entries[1].id, 1], client); }), (error) => error.code === "23505");
  assert.deepEqual((await getChallengeManagement(curator.token, ended.id)).winners, before.winners);
  await assert.rejects(run("rawWinner", [ended.id, entries[3].id, 4]), (error) => error.code === "23514");
  const updated = [selected[1], selected[0], selected[2]].map((entry, index) => ({ rank: index + 1, submissionId: entry.submissionId }));
  await selectWinners(curator.token, ended.id, updated, before.expectedVersion);assert.equal((await getChallenge(ended.id)).winners[0].id, works[1].id);
  const version = (await getChallengeManagement(curator.token, ended.id)).expectedVersion;
  const race = await Promise.allSettled([selectWinners(curator.token, ended.id, [{ rank: 1, submissionId: entries[0].id }], version), selectWinners(curator.token, ended.id, [{ rank: 1, submissionId: entries[3].id }], version)]);
  assert.equal(race.filter((result) => result.status === "fulfilled").length, 1);assert.equal(race.find((result) => result.status === "rejected").reason.code, "CONFLICT");
  console.log("Lulus: publikasi/perbarui hasil, penyimpanan ulang tanpa perubahan, rollback hasil lama, dan konflik dua tab Curator.");

  await run("rawWinner", [active.id, activeSubmission.id, 1]);assert.equal((await getChallenge(active.id)).winners.length, 0);assert(!(await getFeaturedWinners()).some((winner) => winner.challenge_id === active.id));
  for (const token of [admin.token, curator.token, "palsu"]) await fails(getMySubmissions(token), token === "palsu" ? "UNAUTHORIZED" : "FORBIDDEN");
  const many = await challenge(curator, "Galeri tiga belas"), participants = [...members], manyEntries = [];
  for (let i = 0; i < 9; i++) { const member = await account("tambahan-" + i, "member");participants.push(member);works.push(await artwork(member, "Eksplorasi tambahan " + i)); }
  for (let i = 0; i < participants.length; i++) manyEntries.push(await submission(many, participants[i], works[i]));
  const galleryFirst = await getChallengeManagement(curator.token, many.id), galleryLast = await getChallengeManagement(curator.token, many.id, 2);
  assert.equal(galleryFirst.gallery.artworks.length, 12);assert.equal(galleryLast.gallery.artworks.length, 1);assert.equal(galleryFirst.candidates.length, 13);
  assert(!galleryFirst.gallery.artworks.some((artwork) => artwork.submission_id === galleryLast.gallery.artworks[0].submission_id));
  await selectWinners(curator.token, many.id, [{ rank: 1, submissionId: manyEntries.at(-1).id }], "");
  for (let i = 0; i < 13; i++) { const extra = await challenge(curator, "Partisipasi " + i);const own = await submission(extra, members[0], works[0]);if (i > 10) await selectWinners(curator.token, extra.id, [{ rank: 1, submissionId: own.id }], ""); }
  const mineFirst = await getMySubmissions(members[0].token), mineLast = await getMySubmissions(members[0].token, "2147483647");
  assert.equal(mineFirst.artworks.length, 12);assert(mineLast.page > 1);assert.equal(mineLast.page, mineLast.pages);assert(!mineFirst.artworks.some((row) => mineLast.artworks.some((last) => last.submission_id === row.submission_id)));
  assert((await getMySubmissions(members[1].token)).artworks.every((row) => row.member_id === members[1].id));assert.equal((await getMemberOverview(members[0].token)).statistics.submissions, mineFirst.total);
  const featured = await getFeaturedWinners();assert(featured.length <= 3);assert.equal(new Set(featured.map((winner) => winner.id)).size, featured.length);assert(featured.some((winner) => winner.id === works[0].id));assert(featured.every((winner) => winner.challenge_id !== active.id));
  console.log("Lulus: hasil sebelum deadline disembunyikan, seluruh kandidat/paginasi galeri, submisi privat, statistik, dan featured tanpa karya berulang.");

  const racedWork = await artwork(members[3], "Karya moderasi"), racedChallenge = await challenge(curator, "Hasil dan moderasi"), racedSubmission = await submission(racedChallenge, members[3], racedWork);
  await selectWinners(curator.token, racedChallenge.id, [{ rank: 1, submissionId: racedSubmission.id }], "");
  await reportArtwork(members[0].token, racedWork.id, "Lainnya", "Data uji moderasi karya pemenang.");const racedVersion = (await getChallengeManagement(curator.token, racedChallenge.id)).expectedVersion;
  const moderationRace = await Promise.allSettled([selectWinners(curator.token, racedChallenge.id, [{ rank: 1, submissionId: racedSubmission.id }], racedVersion), takeDownArtwork(admin.token, racedWork.id, "yes")]);
  assert.equal(moderationRace[1].status, "fulfilled");for (const result of moderationRace) if (result.status === "rejected") assert(["CONFLICT", "INVALID_SUBMISSION"].includes(result.reason.code));
  assert.equal((await getChallenge(racedChallenge.id)).winners.length, 0);assert(!(await getFeaturedWinners()).some((winner) => winner.id === racedWork.id));
  const queued = await challenge(curator, "Antrean deadline", "active"), queuedSubmission = await submission(queued, members[2], works[2]);
  const blocker = await globalThis.artShowcasePool.connect();let selection;
  try {
    await blocker.query("BEGIN");await query("challengeOwnedLock", [queued.id, curator.id], blocker);
    const end = (await blocker.query(sql.deadline, [queued.id, "1 second"])).rows[0].ends_at;
    selection = selectWinners(curator.token, queued.id, [{ rank: 1, submissionId: queuedSubmission.id }], "");selection.catch(() => {});
    await until(async () => (await run("waits", [])).rows[0].total > 0);await until(async () => (await run("passed", [end])).rows[0].passed);
    await blocker.query("COMMIT");await selection;assert((await getChallenge(queued.id)).winners[0].awarded_at > end);
  } finally { await blocker.query("ROLLBACK");blocker.release();if (selection) await Promise.allSettled([selection]); }
  const session = await decodeSession(curator.token);await query("sessionDelete", [session.hash]);await fails(getChallengeManagement(curator.token, ended.id), "UNAUTHORIZED");
  console.log("Lulus: moderasi bersamaan tanpa deadlock/relasi rusak, waktu keputusan setelah antrean, dan sesi Curator dicabut.");
} finally {
  if (globalThis.artShowcasePool) {
    await withTransaction(async (client) => { for (const user of users) await client.query(sql.cleanup, [user.id]);if (category) await query("categoryDelete", [category.id], client); });
    await globalThis.artShowcasePool.end();
  }
}
