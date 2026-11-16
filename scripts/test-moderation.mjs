import nextEnv from "@next/env";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import { randomBytes, randomUUID } from "node:crypto";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";

nextEnv.loadEnvConfig(process.cwd());
const { query, withTransaction } = await import("../lib/db.js");
const { createSession, decodeSession } = await import("../lib/session.js");
const { getAdminStatistics, getModerationQueue, getArtworkReports, dismissReport, takeDownArtwork, verifyCurator } = await import("../lib/admin.js");
const { getFavorites, getMemberOverview } = await import("../lib/dashboard.js");
const { setInteraction, addComment, reportArtwork } = await import("../lib/interactions.js");
const { removeUploads } = await import("../lib/uploads.js");
const sql = {};
for (const name of ["cleanup", "artwork", "challenge", "report", "related"]) sql[name] = await readFile(new URL("../database/tests/moderation-" + name + ".sql", import.meta.url), "utf8");
for (const name of ["submission-create", "winner-create"]) sql[name] = await readFile(new URL("../database/tests/admin-" + name + ".sql", import.meta.url), "utf8");
sql.cleanupTags = await readFile(new URL("../database/tests/artwork-cleanup-tags.sql", import.meta.url), "utf8");
const marker = randomBytes(6).toString("hex"), users = [], uploads = [], tagName = "moderasi-" + marker;
const hash = await bcrypt.hash("UjiModerasiRuang2026!", 12);
let category;
const fails = (promise, code) => assert.rejects(promise, (error) => error.code === code);
const run = (name, values) => withTransaction((client) => client.query(sql[name], values));
async function account(label, role) {
  const user = await withTransaction(async (client) => {
    const created = (await query("userCreate", ["uji-moderasi-" + marker + "-" + label + "@example.test", hash, "Pengguna Uji " + label, role], client)).rows[0];
    return { ...created, token: (await createSession(created, client)).token };
  });users.push(user);return user;
}
async function artwork(user, title, file = "/examples/art-01.svg") {
  return (await run("artwork", [user.id, category.id, title + " " + marker, file, file.endsWith(".svg") ? "image/svg+xml" : "image/webp"])).rows[0];
}
try {
  const admin = await account("admin-a", "admin");
  const baseline = await getAdminStatistics(admin.token), oldQueue = await getModerationQueue(admin.token);
  const otherAdmin = await account("admin-b", "admin");
  const owner = await account("pemilik", "member"), reporter = await account("pelapor-a", "member"), other = await account("pelapor-b", "member"), curator = await account("kurator", "curator");
  category = (await query("categoryCreate", ["Kategori moderasi " + marker, "Data sementara pengujian."])).rows[0];
  const file = "/uploads/" + randomUUID() + ".webp";uploads.push(file);
  await mkdir(new URL("../public/uploads/", import.meta.url), { recursive: true });
  await writeFile(new URL("../public" + file, import.meta.url), await sharp({ create: { width: 300, height: 200, channels: 3, background: "#a76544" } }).webp().toBuffer());
  const first = await artwork(owner, "Pesisir yang ditinjau", file), second = await artwork(owner, "Karya yang tetap aman");
  await verifyCurator(admin.token, curator.id, "approved", "");
  const active = (await run("challenge", [curator.id, "-1 hour", "1 hour"])).rows[0];
  await run("challenge", [curator.id, "1 hour", "2 hours"]);
  const ended = (await run("challenge", [curator.id, "-2 hours", "-1 hour"])).rows[0];assert(active.id !== ended.id);
  await reportArtwork(reporter.token, first.id, "Plagiat", "Mohon periksa sumber karya ini.");
  await reportArtwork(other.token, first.id, "Lainnya", "Konteks karya ini perlu ditinjau.");
  for (const user of [reporter, other]) await setInteraction(user.token, first.id, "like", "yes");
  await setInteraction(reporter.token, first.id, "favorite", "yes");
  await setInteraction(reporter.token, second.id, "favorite", "yes");
  await addComment(reporter.token, first.id, "Komentar sementara pada karya yang ditinjau.");
  const submission = await withTransaction(async (client) => {
    const tag = (await query("artworkTagUpsert", [tagName], client)).rows[0];await query("artworkTagLink", [first.id, tag.id], client);
    const row = (await client.query(sql["submission-create"], [ended.id, owner.id, first.id])).rows[0];
    await client.query(sql["winner-create"], [ended.id, row.id, 1]);return row;
  });
  const stats = await getAdminStatistics(admin.token);
  assert.equal(stats.admins, baseline.admins + 1);assert.equal(stats.members, baseline.members + 3);assert.equal(stats.curators, baseline.curators + 1);
  assert.equal(stats.artworks, baseline.artworks + 2);assert.equal(stats.pending_reports, baseline.pending_reports + 2);assert.equal(stats.active_challenges, baseline.active_challenges + 1);
  const queue = await getModerationQueue(admin.token);
  assert.equal(queue.total, oldQueue.total + 1);assert.equal(queue.reports, oldQueue.reports + 2);
  const review = await getArtworkReports(admin.token, first.id);assert.equal(review.total, 2);
  assert.deepEqual(review.reports.map((r) => r.reason).sort(), ["Lainnya", "Plagiat"]);
  assert.equal(Object.hasOwn(review.reports[0], "email"), false);
  console.log("Lulus: statistik per role, jumlah laporan tanpa penggandaan join, challenge aktif, dan antrean per karya.");

  for (const token of [owner.token, curator.token, "token-palsu"]) {
    const code = token === "token-palsu" ? "UNAUTHORIZED" : "FORBIDDEN";
    for (const operation of [() => getAdminStatistics(token), () => getModerationQueue(token), () => getArtworkReports(token, first.id), () => dismissReport(token, review.reports[0].id), () => takeDownArtwork(token, first.id, "yes")]) await fails(operation(), code);
  }
  for (const token of [admin.token, curator.token, "token-palsu"]) {
    const code = token === "token-palsu" ? "UNAUTHORIZED" : "FORBIDDEN";
    await fails(getFavorites(token), code);await fails(getMemberOverview(token), code);
  }
  await fails(dismissReport(admin.token, "1 OR 1=1"), "INVALID_ID");
  await fails(getArtworkReports(admin.token, 2147483647), "NOT_FOUND");
  await fails(takeDownArtwork(admin.token, first.id, ""), "CONFIRMATION");
  await fails(takeDownArtwork(admin.token, second.id, "yes"), "NO_PENDING_REPORTS");
  console.log("Lulus: role/sesi pada pembacaan dan perubahan, ID parameter, konfirmasi, serta larangan menghapus karya tanpa laporan menunggu.");

  const dismissed = review.reports[0];await dismissReport(admin.token, dismissed.id);
  const audit = (await run("report", [dismissed.id])).rows[0];assert.equal(audit.status, "dismissed");assert.equal(audit.reviewed_by, admin.id);assert(audit.reviewed_at instanceof Date);
  assert.equal((await getArtworkReports(admin.token, first.id)).total, 1);
  assert.equal((await query("artworkDetail", [first.id])).rowCount, 1);
  await fails(dismissReport(otherAdmin.token, dismissed.id), "CONFLICT");
  await fails(reportArtwork(reporter.token, first.id, "Plagiat", "Permintaan laporan ulang untuk pengujian."), "ALREADY_REPORTED");
  const before = (await run("related", [first.id, submission.id])).rows[0];
  assert.deepEqual(before, { artworks: 1, artwork_tags: 1, likes: 2, favorites: 1, comments: 1, reports: 2, submissions: 1, winners: 1 });
  const rollback = new Error("Pembatalan uji penghapusan");
  await assert.rejects(withTransaction(async (client) => {
    await query("moderationArtworkLock", [first.id], client);await query("moderationArtworkDelete", [first.id], client);
    assert(Object.values((await client.query(sql.related, [first.id, submission.id])).rows[0]).every((value) => value === 0));
    throw rollback;
  }), (error) => error === rollback);
  assert.deepEqual((await run("related", [first.id, submission.id])).rows[0], before);
  assert((await stat(new URL("../public" + file, import.meta.url))).isFile());
  const removed = await takeDownArtwork(otherAdmin.token, first.id, "yes");assert.equal(removed.file_path, file);
  assert(Object.values((await run("related", [first.id, submission.id])).rows[0]).every((value) => value === 0));
  assert.equal((await query("artworkDetail", [second.id])).rowCount, 1);
  await removeUploads([removed.file_path]);await assert.rejects(stat(new URL("../public" + file, import.meta.url)), (error) => error.code === "ENOENT");
  console.log("Lulus: dismiss dengan audit, laporan unik tetap berlaku, rollback CASCADE, serta take down dan pembersihan berkas setelah commit.");

  const raced = await artwork(owner, "Keputusan bersamaan");await reportArtwork(reporter.token, raced.id, "Lainnya", "Laporan untuk pengujian dua Admin.");
  const racedReport = (await getArtworkReports(admin.token, raced.id)).reports[0];
  const race = await Promise.allSettled([dismissReport(admin.token, racedReport.id), takeDownArtwork(otherAdmin.token, raced.id, "yes")]);
  assert.equal(race.filter((result) => result.status === "fulfilled").length, 1);
  assert(["NOT_FOUND", "NO_PENDING_REPORTS"].includes(race.find((result) => result.status === "rejected").reason.code));
  const stillExists = (await query("artworkDetail", [raced.id])).rowCount;
  if (stillExists) assert.equal((await getArtworkReports(admin.token, raced.id)).total, 0);
  else assert.equal((await query("reportFind", [racedReport.id])).rowCount, 0);
  console.log("Lulus: keputusan dua Admin bersamaan menghasilkan satu keputusan yang berlaku.");

  for (let i = 0; i < 7; i++) { const art = await artwork(owner, "Antrean tambahan " + i);await reportArtwork(reporter.token, art.id, "Lainnya", "Laporan untuk menguji halaman antrean."); }
  const queueFirst = await getModerationQueue(admin.token), queueLast = await getModerationQueue(admin.token, "2147483647");
  assert.equal(queueFirst.artworks.length, 6);assert(queueLast.page > 1);assert.equal(queueLast.page, queueLast.pages);
  assert(!queueFirst.artworks.some((art) => queueLast.artworks.some((lastArt) => lastArt.id === art.id)));
  const many = await artwork(owner, "Rincian banyak laporan"), manyReporters = [reporter, other];
  for (let i = 0; i < 9; i++) manyReporters.push(await account("pelapor-tambahan-" + i, "member"));
  for (const user of manyReporters) await reportArtwork(user.token, many.id, "Lainnya", "Laporan untuk menguji paginasi rincian.");
  const reportsFirst = await getArtworkReports(admin.token, many.id), reportsLast = await getArtworkReports(admin.token, many.id, 2);
  assert.equal(reportsFirst.total, 11);assert.equal(reportsFirst.reports.length, 10);assert.equal(reportsLast.reports.length, 1);
  assert(!reportsFirst.reports.some((report) => report.id === reportsLast.reports[0].id));
  console.log("Lulus: antrean enam karya per halaman dan rincian sepuluh laporan per halaman.");

  const saved = [];
  for (let i = 0; i < 13; i++) { const art = await artwork(owner, "Inspirasi " + i);saved.push(art.id);await setInteraction(reporter.token, art.id, "favorite", "yes"); }
  const privateArt = await artwork(owner, "Favorit pengguna lain");await setInteraction(other.token, privateArt.id, "favorite", "yes");
  const firstPage = await getFavorites(reporter.token), lastPage = await getFavorites(reporter.token, "2147483647");
  assert.equal(firstPage.total, 14);assert.equal(firstPage.artworks.length, 12);assert.equal(lastPage.page, 2);assert.equal(lastPage.artworks.length, 2);
  assert.equal(firstPage.artworks[0].id, saved.at(-1));assert(!firstPage.artworks.some((art) => lastPage.artworks.some((otherArt) => otherArt.id === art.id)));
  assert.equal((await getFavorites(other.token)).total, 1);assert.equal((await getFavorites(other.token)).artworks[0].id, privateArt.id);
  assert(![...firstPage.artworks, ...lastPage.artworks].some((art) => art.id === privateArt.id));
  assert.equal((await getFavorites(reporter.token, "1 OR 1=1")).page, 1);
  await setInteraction(reporter.token, saved.at(-1), "favorite", "no");assert.equal((await getFavorites(reporter.token)).total, 13);
  for (const user of [reporter, other]) await setInteraction(user.token, second.id, "like", "yes");
  const overview = await getMemberOverview(owner.token);assert.equal(overview.statistics.likes, 2);assert.equal(overview.statistics.favorites, 0);assert.equal(overview.artworks.length, 3);assert(overview.artworks.every((art) => art.member_id === owner.id));
  assert.equal((await getMemberOverview(reporter.token)).statistics.artworks, 0);
  const session = await decodeSession(admin.token);await query("sessionDelete", [session.hash]);await fails(getAdminStatistics(admin.token), "UNAUTHORIZED");await fails(dismissReport(admin.token, 1), "UNAUTHORIZED");
  const memberSession = await decodeSession(owner.token);await query("sessionDelete", [memberSession.hash]);await fails(getFavorites(owner.token), "UNAUTHORIZED");
  console.log("Lulus: favorit privat, urutan/paginasi, hitungan dashboard Member, dan sesi yang sudah dicabut.");
} finally {
  if (globalThis.artShowcasePool) {
    await withTransaction(async (client) => {
      for (const user of users) await client.query(sql.cleanup, [user.id]);
      if (category) await query("categoryDelete", [category.id], client);
      await client.query(sql.cleanupTags, [[tagName]]);
    });
    await globalThis.artShowcasePool.end();
  }
  await removeUploads(uploads);
}
