import nextEnv from "@next/env";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import bcrypt from "bcryptjs";
import sharp from "sharp";

nextEnv.loadEnvConfig(process.cwd());
const { query, withTransaction } = await import("../lib/db.js");
const { createSession, decodeSession } = await import("../lib/session.js");
const { createArtwork, updateArtwork, deleteArtwork, getGallery } = await import("../lib/artworks.js");
const { removeUploads, saveArtworkImage } = await import("../lib/uploads.js");
const { galleryFilters, searchPattern, MAX_IMAGE_BYTES } = await import("../lib/artwork-rules.js");
const sql = {};
for (const name of ["cleanup-user", "cleanup-tags", "owned-files", "file-change", "like"]) {
  sql[name] = await readFile(new URL("../database/tests/artwork-" + name + ".sql", import.meta.url), "utf8");
}
const marker = randomBytes(6).toString("hex");
const names = ["uji-" + marker, "warna-" + marker, "baru-" + marker, "rollback-" + marker];
const emails = [], accounts = [], uploads = [];
const passwordHash = await bcrypt.hash("UjiKaryaRuang2026!", 12);
let category;
async function fixture(label, role) {
  const email = "uji-karya-" + marker + "-" + label + "@example.test";emails.push(email);
  const result = await withTransaction(async (client) => {
    const user = (await query("userCreate", [email, passwordHash, "Kreator Uji " + label, role], client)).rows[0];
    return { ...user, token: (await createSession(user, client)).token };
  });
  accounts.push(result);return result;
}
const fails = (promise, code) => assert.rejects(promise, (error) => error.code === code);
const png = await sharp({ create: { width: 160, height: 120, channels: 3, background: "#ad5437" } }).png().toBuffer();
const pngFile = (name = "gambar.png") => new File([png], name, { type: "image/png" });
try {
  const owner = await fixture("pemilik", "member"), other = await fixture("lain", "member");
  const curator = await fixture("kurator", "curator"), admin = await fixture("admin", "admin");
  category = (await query("categoryCreate", ["Kategori uji " + marker, "Kategori sementara untuk pengujian karya."])).rows[0];
  const values = { title: "Studi 50%_ " + marker, description: "Cerita karya untuk pengujian.", categoryId: String(category.id), tags: names[0].toUpperCase() + ", " + names[0] + ", " + names[1] };
  assert.equal(galleryFilters({ category: "1 OR 1=1" }).error, "Filter kategori tidak valid.");
  assert(galleryFilters({ sort: "judul;DROP TABLE users" }).error);
  assert.equal(searchPattern("%_"), "%\\%\\_%");
  for (const account of [curator, admin]) await fails(createArtwork(account.token, values, pngFile()), "FORBIDDEN");
  await fails(createArtwork("token-palsu", values, pngFile()), "UNAUTHORIZED");
  await fails(createArtwork(owner.token, { ...values, tags: ", ," }, pngFile()), "VALIDATION");
  await fails(createArtwork(owner.token, { ...values, tags: Array.from({length:11}, (_, index) => "tag" + index).join(",") }, pngFile()), "VALIDATION");
  await fails(createArtwork(owner.token, { ...values, categoryId: "2147483647" }, pngFile()), "CATEGORY_UNAVAILABLE");
  await fails(createArtwork(owner.token, values, null), "INVALID_FILE");
  await fails(createArtwork(owner.token, values, new File([Buffer.alloc(MAX_IMAGE_BYTES + 1)], "besar.png", { type: "image/png" })), "FILE_TOO_LARGE");
  await fails(createArtwork(owner.token, values, new File(["<svg></svg>"], "gambar.svg", { type: "image/svg+xml" })), "INVALID_FILE_TYPE");
  await fails(createArtwork(owner.token, values, new File(["<script>alert(1)</script>"], "palsu.png", { type: "image/png" })), "INVALID_IMAGE");
  await fails(createArtwork(owner.token, values, new File([png], "gambar.jpg", { type: "image/jpeg" })), "INVALID_IMAGE");
  const hugePixels = await sharp({ create: { width: 5000, height: 4001, channels: 3, background: "#ad5437" } }).png().toBuffer();
  await fails(createArtwork(owner.token, values, new File([hugePixels], "dimensi.png", { type: "image/png" })), "INVALID_IMAGE");
  for (const [format, extension, type] of [["jpeg", "jpg", "image/jpeg"], ["webp", "webp", "image/webp"]]) {
    const buffer = await sharp(png)[format]().toBuffer();
    const stored = await saveArtworkImage(new File([buffer], "contoh." + extension, { type }));
    uploads.push(stored);
    assert.equal((await sharp(await readFile(new URL("../public" + stored, import.meta.url))).metadata()).format, "webp");
    await removeUploads([stored]);
  }

  const before = await readdir(new URL("../public/uploads/", import.meta.url));
  await assert.rejects(createArtwork(owner.token, { ...values, tags: names[3] + ", zzz\0invalid" }, pngFile()));
  assert.deepEqual((await readdir(new URL("../public/uploads/", import.meta.url))).sort(), before.sort());
  assert.equal((await getGallery({ creatorId: owner.id })).total, 0);
  const artwork = await createArtwork(owner.token, { ...values, member_id: other.id, file_path: "/uploads/palsu.png" }, pngFile("../../nama-asli.png"));
  uploads.push(artwork.file_path);
  const detail = (await query("artworkDetail", [artwork.id])).rows[0];
  assert.equal(detail.member_id, owner.id);
  assert.equal(detail.media_type, "image/webp");
  assert.deepEqual(detail.tags.sort(), names.slice(0,2).sort());
  assert.match(detail.file_path, /^\/uploads\/[a-f0-9-]+\.webp$/);
  const diskFile = new URL("../public" + detail.file_path, import.meta.url);
  const bytes = await readFile(diskFile);
  assert.equal((await sharp(bytes).metadata()).format, "webp");
  await fails(updateArtwork(other.token, artwork.id, values), "NOT_FOUND");
  await fails(deleteArtwork(other.token, artwork.id, "yes"), "NOT_FOUND");
  await fails(updateArtwork(owner.token, artwork.id, values, pngFile()), "IMMUTABLE_FILE");
  await assert.rejects(withTransaction((client) => client.query(sql["file-change"], [artwork.id, "/uploads/pengganti.webp"])), (error) => error.code === "23514");
  await updateArtwork(owner.token, artwork.id, { ...values, title: "Diperbarui " + marker, tags: names[2] });
  assert.deepEqual((await query("artworkDetail", [artwork.id])).rows[0].tags, [names[2]]);
  assert.deepEqual(await readFile(diskFile), bytes);
  await assert.rejects(updateArtwork(owner.token, artwork.id, { ...values, title: "Tidak boleh tersimpan", tags: names[0] + ", zzz\0invalid" }));
  const afterRollback = (await query("artworkDetail", [artwork.id])).rows[0];
  assert.equal(afterRollback.title, "Diperbarui " + marker);
  assert.deepEqual(afterRollback.tags, [names[2]]);

  const second = await createArtwork(owner.token, { ...values, title: "Karya baru 50%_ " + marker }, pngFile());uploads.push(second.file_path);
  await withTransaction((client) => client.query(sql.like, [other.id, artwork.id]));
  const popular = await getGallery({ creatorId: owner.id, sort: "popular" });
  assert.equal(popular.artworks[0].id, artwork.id);
  assert.equal((await getGallery({ creatorId: owner.id })).artworks[0].id, second.id);
  assert.equal((await getGallery({ q: "%_", creatorId: owner.id })).total, 1);
  assert.equal((await getGallery({ q: "' OR 1=1--", creatorId: owner.id })).total, 0);
  assert.equal((await getGallery({ q: "Kreator Uji pemilik", categoryId: category.id })).total, 2);
  const firstPage = await getGallery({ creatorId: owner.id, pageSize: 1, page: 1 });
  const nextPage = await getGallery({ creatorId: owner.id, pageSize: 1, page: 2 });
  assert.notEqual(firstPage.artworks[0].id, nextPage.artworks[0].id);
  await fails(deleteArtwork(owner.token, artwork.id, ""), "CONFIRMATION");
  const removed = await deleteArtwork(owner.token, artwork.id, "yes");
  await removeUploads([removed.file_path]);
  assert.equal((await query("artworkDetail", [artwork.id])).rowCount, 0);
  await assert.rejects(stat(diskFile), (error) => error.code === "ENOENT");
  const session = await decodeSession(owner.token);await query("sessionDelete", [session.hash]);
  await fails(createArtwork(owner.token, values, pngFile()), "UNAUTHORIZED");
  console.log("Lulus: validasi gambar, tags, transaksi/rollback berkas, kepemilikan, file tetap, pencarian, urutan galeri, dan hapus karya.");
} finally {
  if (globalThis.artShowcasePool) {
    for (const user of accounts) {
      const files = await withTransaction(async (client) => (await client.query(sql["owned-files"], [user.id])).rows);
      uploads.push(...files.map((file) => file.file_path));
    }
    await withTransaction(async (client) => {
      for (const email of emails) await client.query(sql["cleanup-user"], [email]);
      if (category) await query("categoryDelete", [category.id], client);
      await client.query(sql["cleanup-tags"], [names]);
    });
    await globalThis.artShowcasePool.end();
  }
  await removeUploads(uploads);
}
