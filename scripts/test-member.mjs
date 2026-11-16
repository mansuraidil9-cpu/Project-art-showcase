import nextEnv from "@next/env";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import bcrypt from "bcryptjs";
import sharp from "sharp";

nextEnv.loadEnvConfig(process.cwd());
const { query, withTransaction } = await import("../lib/db.js");
const { createSession, getSessionUser, limitKey } = await import("../lib/session.js");
const { createArtwork } = await import("../lib/artworks.js");
const { setInteraction, addComment, deleteComment, reportArtwork } = await import("../lib/interactions.js");
const { updateProfile, changeEmail, changePassword } = await import("../lib/profile.js");
const { removeUploads, saveProfileImage } = await import("../lib/uploads.js");
const sql = {};
for (const name of ["cleanup", "counts", "dismiss", "sessions"]) sql[name] = await readFile(new URL("../database/tests/member-" + name + ".sql", import.meta.url), "utf8");
sql.cleanupTags = await readFile(new URL("../database/tests/artwork-cleanup-tags.sql", import.meta.url), "utf8");
const stamp = randomBytes(6).toString("hex"), pass = "UjiMemberRuang2026!", accounts = [], files = [];
const hash = await bcrypt.hash(pass, 12);
const png = await sharp({ create: { width: 1500, height: 1100, channels: 3, background: "#a76544" } }).png().toBuffer();
const photo = () => new File([png], "profil.png", { type: "image/png" });
const fails = (promise, code) => assert.rejects(promise, (error) => error.code === code);
const run = (name, values) => withTransaction((client) => client.query(sql[name], values));
let category;
async function fixture(label, role) {
  const user = await withTransaction(async (client) => {
    const account = (await query("userCreate", ["uji-member-" + stamp + "-" + label + "@example.test", hash, "Pengguna Uji " + label, role], client)).rows[0];
    return { ...account, email: "uji-member-" + stamp + "-" + label + "@example.test", token: (await createSession(account, client)).token };
  });accounts.push(user);return user;
}
async function freshToken(user) { return withTransaction(async (client) => (await createSession(user, client)).token); }
async function clearLimit(user, scope) { await query("limitDelete", [limitKey(scope, String(user.id))]); }
try {
  const owner = await fixture("pemilik", "member"), member = await fixture("pengunjung", "member");
  const curator = await fixture("kurator", "curator"), admin = await fixture("admin", "admin");
  category = (await query("categoryCreate", ["Kategori member " + stamp, "Kategori sementara pengujian Member."])).rows[0];
  const art = await createArtwork(owner.token, { title: "Studi pesisir", description: "Karya sementara untuk menguji interaksi.", tags: "pesisir-" + stamp, categoryId: String(category.id) }, photo());files.push(art.file_path);
  for (const token of [curator.token, admin.token, "token-palsu"]) {
    const code = token === "token-palsu" ? "UNAUTHORIZED" : "FORBIDDEN";
    await fails(setInteraction(token, art.id, "like", "yes"), code);
    await fails(addComment(token, art.id, "Komentar yang dilarang"), code);
    await fails(reportArtwork(token, art.id, "SARA", "Alasan untuk diuji di backend."), code);
    await fails(updateProfile(token, { displayName: "Palsu" }), code);
    await fails(changeEmail(token, "baru@example.test", pass), code);
    await fails(changePassword(token, pass, "PasswordBaru2026!", "PasswordBaru2026!"), code);
  }
  await fails(setInteraction(member.token, "1 OR 1=1", "like", "yes"), "INVALID_ID");
  await fails(setInteraction(member.token, art.id, "like;DROP", "yes"), "VALIDATION");
  await fails(setInteraction(member.token, art.id, "like", "true"), "VALIDATION");
  await fails(setInteraction(member.token, 2147483647, "like", "yes"), "NOT_FOUND");
  await Promise.all(Array.from({ length: 4 }, () => setInteraction(member.token, art.id, "like", "yes")));
  await Promise.all(Array.from({ length: 3 }, () => setInteraction(member.token, art.id, "favorite", "yes")));
  assert.deepEqual((await run("counts", [member.id, art.id])).rows[0], { likes: 1, favorites: 1, reports: 0 });
  assert.deepEqual((await query("interactionState", [art.id, member.id])).rows[0], { liked: true, favorited: true, report_status: null });
  await setInteraction(member.token, art.id, "like", "no");await setInteraction(member.token, art.id, "favorite", "no");
  assert.deepEqual((await run("counts", [member.id, art.id])).rows[0], { likes: 0, favorites: 0, reports: 0 });
  console.log("Lulus: role, sesi, ID, pilihan query tetap, serta like/favorit idempoten bersamaan.");

  for (const body of ["   ", "a".repeat(1001)]) await fails(addComment(member.token, art.id, body), "VALIDATION");
  const comment = await addComment(member.token, art.id, "  <script>alert('uji')</script> ' OR 1=1--  ");
  assert((await query("artworkComments", [art.id])).rows.some((row) => row.body === "<script>alert('uji')</script> ' OR 1=1--"));
  await fails(deleteComment(owner.token, comment.id), "NOT_FOUND");
  await fails(deleteComment(curator.token, comment.id), "FORBIDDEN");
  await deleteComment(member.token, comment.id);
  await fails(deleteComment(member.token, comment.id), "NOT_FOUND");
  await fails(reportArtwork(owner.token, art.id, "Plagiat", "Penjelasan laporan lengkap."), "SELF_REPORT");
  await fails(reportArtwork(member.token, art.id, "Pilihan palsu", "Penjelasan laporan lengkap."), "VALIDATION");
  await fails(reportArtwork(member.token, art.id, "Plagiat", "pendek"), "VALIDATION");
  const reports = await Promise.allSettled([1,2].map(() => reportArtwork(member.token, art.id, "Plagiat", "Perlu diperiksa sumber karya ini.")));
  assert.equal(reports.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(reports.find((r) => r.status === "rejected").reason.code, "ALREADY_REPORTED");
  await run("dismiss", [member.id, art.id, admin.id]);
  await fails(reportArtwork(member.token, art.id, "SARA", "Percobaan laporan ulang setelah ditinjau."), "ALREADY_REPORTED");
  console.log("Lulus: komentar milik sendiri, konten sebagai teks, laporan karya sendiri/duplikat, dan laporan setelah dismiss.");

  const profile = { displayName: "Aidil Uji", bio: "Merekam cahaya pesisir.", website: "https://example.com/portofolio", instagram: "https://www.instagram.com/aidiluji", behance: "https://www.behance.net/aidiluji", id: owner.id };
  for (const extra of [{ displayName: " " }, { bio: "a".repeat(501) }, { website: "javascript:alert(1)" }, { website: "https://user:pass@example.com" }, { instagram: "https://instagram.com.example.com/aidil" }, { behance: "https://behance.com/aidil" }]) await fails(updateProfile(member.token, { ...profile, ...extra }), "VALIDATION");
  await fails(updateProfile(member.token, profile, new File([Buffer.alloc(2 * 1024 * 1024 + 1)], "besar.png", { type: "image/png" })), "FILE_TOO_LARGE");
  await fails(saveProfileImage(new File(["<svg></svg>"], "palsu.png", { type: "image/png" })), "INVALID_IMAGE");
  await fails(updateProfile(member.token, profile, photo(), "yes"), "VALIDATION");
  const before = await readdir(new URL("../public/uploads/", import.meta.url));
  await assert.rejects(updateProfile(member.token, { ...profile, bio: "gagal\0simpan" }, photo()));
  assert.deepEqual((await readdir(new URL("../public/uploads/", import.meta.url))).sort(), before.sort());
  await updateProfile(member.token, profile, photo());
  let saved = (await query("profileOwn", [member.id])).rows[0];files.push(saved.avatar_path);
  assert.equal(saved.display_name, profile.displayName);
  assert.notEqual((await query("profileOwn", [owner.id])).rows[0].display_name, profile.displayName);
  const image = await sharp(await readFile(new URL("../public" + saved.avatar_path, import.meta.url))).metadata();
  assert(image.width <= 1024 && image.height <= 1024);assert.equal(image.format, "webp");
  const oldPhoto = saved.avatar_path;
  await updateProfile(member.token, { ...profile, displayName: "Aidil Diperbarui" }, photo());
  saved = (await query("profileOwn", [member.id])).rows[0];files.push(saved.avatar_path);
  await assert.rejects(stat(new URL("../public" + oldPhoto, import.meta.url)), (e) => e.code === "ENOENT");
  await updateProfile(member.token, profile, null, "yes");
  assert.equal((await query("profileOwn", [member.id])).rows[0].avatar_path, null);
  await assert.rejects(stat(new URL("../public" + saved.avatar_path, import.meta.url)), (e) => e.code === "ENOENT");
  const publicProfile = (await query("creatorPublic", [member.id])).rows[0];
  assert.equal(Object.hasOwn(publicProfile, "email"), false);assert.equal(Object.hasOwn(publicProfile, "password_hash"), false);
  console.log("Lulus: profil berdasarkan sesi, URL aman, avatar 2 MB/1.024 piksel, penggantian/penghapusan berkas, dan rollback unggahan.");

  await fails(changeEmail(member.token, "invalid", pass), "VALIDATION");
  await fails(changeEmail(member.token, owner.email, "salah"), "PASSWORD");
  await fails(changeEmail(member.token, owner.email, pass), "EMAIL_TAKEN");
  assert(await getSessionUser(member.token));
  await clearLimit(member, "change-email");
  const secondToken = await freshToken(member);
  const email = "uji-member-" + stamp + "-baru@example.test";
  await changeEmail(member.token, email.toUpperCase(), pass);
  assert.equal((await query("profilePrivateLock", [member.id])).rows[0].email, email);
  assert.equal(await getSessionUser(member.token), null);assert.equal(await getSessionUser(secondToken), null);
  assert.equal((await run("sessions", [member.id])).rows[0].total, 0);
  await fails(changePassword(member.token, pass, "PasswordBaru2026!", "PasswordBaru2026!"), "UNAUTHORIZED");
  member.token = await freshToken(member);
  await fails(changePassword(member.token, pass, "pendek", "pendek"), "VALIDATION");
  await fails(changePassword(member.token, pass, "PasswordBaru2026!", "beda"), "VALIDATION");
  await fails(changePassword(member.token, "salah", "PasswordBaru2026!", "PasswordBaru2026!"), "PASSWORD");
  await clearLimit(member, "change-password");
  for (let i = 0; i < 5; i++) await fails(changePassword(member.token, "salah", "PasswordBaru2026!", "PasswordBaru2026!"), "PASSWORD");
  await fails(changePassword(member.token, pass, "PasswordBaru2026!", "PasswordBaru2026!"), "RATE_LIMIT");
  await clearLimit(member, "change-password");
  const second = await freshToken(member);
  await changePassword(member.token, pass, "PasswordBaru2026!", "PasswordBaru2026!");
  const privateAccount = (await query("profilePrivateLock", [member.id])).rows[0];
  assert(await bcrypt.compare("PasswordBaru2026!", privateAccount.password_hash));
  assert.equal(await bcrypt.compare(pass, privateAccount.password_hash), false);
  assert.equal(await getSessionUser(second), null);assert.equal(await getSessionUser(member.token), null);
  assert.equal((await run("sessions", [member.id])).rows[0].total, 0);
  console.log("Lulus: konfirmasi password saat ini, email unik, bcrypt, pembatasan percobaan, serta pencabutan seluruh sesi secara atomik.");
} finally {
  if (globalThis.artShowcasePool) {
    for (const user of accounts) {
      const profile = (await query("profileOwn", [user.id])).rows[0];if (profile?.avatar_path) files.push(profile.avatar_path);
      for (const scope of ["change-email", "change-password"]) await clearLimit(user, scope);
    }
    await withTransaction(async (client) => { for (const user of accounts) await client.query(sql.cleanup, [user.id]); if (category) await query("categoryDelete", [category.id], client); await client.query(sql.cleanupTags, [["pesisir-" + stamp]]); });
    await globalThis.artShowcasePool.end();
  }
  await removeUploads(files);
}
