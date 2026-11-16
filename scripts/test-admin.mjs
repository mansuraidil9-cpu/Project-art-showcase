import nextEnv from "@next/env";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { randomBytes, randomUUID } from "node:crypto";
import { readFile, writeFile, mkdir, stat, unlink } from "node:fs/promises";

nextEnv.loadEnvConfig(process.cwd());
const { query, withTransaction } = await import("../lib/db.js");
const { createSession, decodeSession, getSessionUser } = await import("../lib/session.js");
const { createCategory, updateCategory, deleteCategory, deleteUser, verifyCurator } = await import("../lib/admin.js");
const { removeUploads } = await import("../lib/uploads.js");
const sql = {};
for (const name of ["cleanup-user", "artwork-create", "challenge-create", "interactions-create", "favorite-create", "comment-create", "report-create", "submission-create", "winner-create", "member-related", "curator-related"]) {
  sql[name] = await readFile(new URL("../database/tests/admin-" + name + ".sql", import.meta.url), "utf8");
}
const marker = randomBytes(6).toString("hex");
const emails = [];
const categories = [];
const file = "/uploads/" + randomUUID() + ".png";
const diskFile = new URL("../public" + file, import.meta.url);
const hash = await bcrypt.hash("UjiAdminRuang2026!", 12);

async function account(label, role) {
  const email = "uji-admin-" + marker + "-" + label + "@example.test";
  emails.push(email);
  return withTransaction(async (client) => {
    const user = (await query("userCreate", [email, hash, "Pengguna Uji " + label, role], client)).rows[0];
    return { ...user, email, token: (await createSession(user, client)).token };
  });
}
async function run(callback) { return withTransaction(callback); }
async function fails(promise, code) {
  await assert.rejects(promise, (error) => error.code === code);
}

try {
  const admin = await account("admin-a", "admin");
  const otherAdmin = await account("admin-b", "admin");
  const member = await account("member-a", "member");
  const otherMember = await account("member-b", "member");
  const curator = await account("curator-a", "curator");
  const rejected = await account("curator-b", "curator");
  const raceCurator = await account("curator-c", "curator");
  const firstPage = (await query("adminUsersList", ["member", 1, 0])).rows;
  const secondPage = (await query("adminUsersList", ["member", 1, 1])).rows;
  assert.equal(firstPage.length, 1);
  assert.equal(secondPage.length, 1);
  assert.equal(firstPage[0].role, "member");
  assert.notEqual(firstPage[0].id, secondPage[0].id);
  assert.equal((await query("adminUsersCount", ["member' OR 1=1--"])).rows[0].total, 0);

  const category = await createCategory(admin.token, { name: "  Uji   Admin " + marker + "  ", description: "Deskripsi uji." });
  categories.push(category.id);
  assert.equal(category.name, "Uji Admin " + marker);
  const second = await createCategory(admin.token, { name: "Uji lain " + marker, description: "" });
  categories.push(second.id);
  await fails(createCategory(admin.token, { name: category.name.toUpperCase() }), "DUPLICATE_CATEGORY");
  await fails(createCategory(admin.token, { name: " " }), "VALIDATION");
  await fails(createCategory(admin.token, { name: "a".repeat(61) }), "VALIDATION");
  await fails(updateCategory(admin.token, second.id, { name: category.name }), "DUPLICATE_CATEGORY");
  assert.equal((await query("categoryFind", [second.id])).rows[0].name, second.name);
  await updateCategory(admin.token, second.id, { name: "Uji diperbarui " + marker, description: "Deskripsi baru." });
  assert.equal((await query("categoryFind", [second.id])).rows[0].description, "Deskripsi baru.");
  await fails(updateCategory(admin.token, "1 OR 1=1", { name: "Sisipan" }), "INVALID_ID");
  await fails(deleteCategory(admin.token, second.id, ""), "CONFIRMATION");

  for (const operation of [
    () => createCategory(member.token, { name: "Terlarang" }),
    () => updateCategory(member.token, category.id, { name: "Terlarang" }),
    () => deleteCategory(member.token, category.id, "yes"),
    () => deleteUser(member.token, otherMember.id, otherMember.email),
    () => verifyCurator(member.token, curator.id, "approved", ""),
  ]) await fails(operation(), "FORBIDDEN");
  await fails(createCategory("token-palsu", { name: "Terlarang" }), "UNAUTHORIZED");
  await fails(deleteUser(admin.token, admin.id, admin.email), "PROTECTED_ADMIN");
  await fails(deleteUser(admin.token, otherAdmin.id, otherAdmin.email), "PROTECTED_ADMIN");
  await fails(deleteUser(admin.token, member.id, otherMember.email), "CONFIRMATION");
  assert(await getSessionUser(member.token));

  await fails(verifyCurator(admin.token, curator.id, "rejected", " "), "VALIDATION");
  await fails(verifyCurator(admin.token, curator.id, "admin", ""), "VALIDATION");
  await verifyCurator(admin.token, curator.id, "approved", "");
  assert.equal((await getSessionUser(curator.token)).curator_status, "approved");
  await fails(verifyCurator(admin.token, curator.id, "rejected", "Sudah diproses."), "CONFLICT");
  await verifyCurator(admin.token, rejected.id, "rejected", "Identitas komunitas belum lengkap.");
  assert.equal((await getSessionUser(rejected.token)).rejection_reason, "Identitas komunitas belum lengkap.");
  const race = await Promise.allSettled([
    verifyCurator(admin.token, raceCurator.id, "approved", ""),
    verifyCurator(otherAdmin.token, raceCurator.id, "rejected", "Profil perlu dilengkapi."),
  ]);
  assert.equal(race.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(race.find((result) => result.status === "rejected").reason.code, "CONFLICT");

  await mkdir(new URL("../public/uploads/", import.meta.url), { recursive: true });
  await writeFile(diskFile, Buffer.from("berkas-uji-admin"));
  const related = await run(async (client) => {
    const artwork = (await client.query(sql["artwork-create"], [member.id, category.id, file])).rows[0];
    const otherArtwork = (await client.query(sql["artwork-create"], [otherMember.id, second.id, "/examples/art-01.svg"])).rows[0];
    const challenge = (await client.query(sql["challenge-create"], [curator.id])).rows[0];
    for (const kind of ["interactions-create", "favorite-create", "comment-create", "report-create"]) {
      await client.query(sql[kind], [otherMember.id, artwork.id]);
    }
    const submission = (await client.query(sql["submission-create"], [challenge.id, member.id, artwork.id])).rows[0];
    const otherSubmission = (await client.query(sql["submission-create"], [challenge.id, otherMember.id, otherArtwork.id])).rows[0];
    await client.query(sql["winner-create"], [challenge.id, submission.id, 1]);
    await client.query(sql["winner-create"], [challenge.id, otherSubmission.id, 2]);
    return { artwork, otherArtwork, challenge, submission, otherSubmission };
  });
  await fails(deleteCategory(admin.token, category.id, "yes"), "CATEGORY_IN_USE");
  const removed = await deleteUser(admin.token, member.id, member.email);
  assert(removed.files.includes(file));
  const counts = await run(async (client) => (await client.query(sql["member-related"], [member.id, related.artwork.id, related.submission.id])).rows[0]);
  assert(Object.values(counts).every((value) => value === 0));
  assert.equal(await getSessionUser(member.token), null);
  assert.equal(await removeUploads(removed.files), 0);
  await assert.rejects(stat(diskFile), (error) => error.code === "ENOENT");
  await removeUploads(["/examples/art-01.svg", "/uploads/../.env.local", "/uploads/subfolder/file.png"]);
  assert((await stat(new URL("../public/examples/art-01.svg", import.meta.url))).isFile());

  await deleteUser(admin.token, curator.id, curator.email);
  const remaining = await run(async (client) => (await client.query(sql["curator-related"], [curator.id, related.challenge.id, related.otherSubmission.id, related.otherArtwork.id])).rows[0]);
  assert.deepEqual(remaining, { users: 0, challenges: 0, submissions: 0, winners: 0, other_artwork: 1 });
  await deleteCategory(admin.token, category.id, "yes");
  const decoded = await decodeSession(admin.token);
  await query("sessionDelete", [decoded.hash]);
  await fails(createCategory(admin.token, { name: "Sesi lama" }), "UNAUTHORIZED");
  console.log("Lulus: CRUD kategori, nama unik, akses Admin, proteksi akun Admin, verifikasi bersamaan, CASCADE, sesi dicabut, dan pembersihan unggahan.");
} finally {
  if (globalThis.artShowcasePool) {
    await withTransaction(async (client) => {
      for (const email of emails) await client.query(sql["cleanup-user"], [email]);
      for (const id of categories) await query("categoryDelete", [id], client);
    });
    await globalThis.artShowcasePool.end();
  }
  try { await unlink(diskFile); } catch (error) { if (error.code !== "ENOENT") throw error; }
}
