import nextEnv from "@next/env";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import bcrypt from "bcryptjs";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
const files = {
  schema: "schema.sql", seed: "seed.sql", migration: "migrations/003-demo-gallery.sql",
  create: "tests/demo-create-database.sql", drop: "tests/demo-drop-database.sql",
  snapshot: "tests/demo-snapshot.sql", legacy: "tests/demo-legacy.sql", custom: "tests/demo-custom.sql",
  immutable: "tests/demo-immutable.sql", error: "tests/demo-error.sql",
};
const sql = {};
for (const [name, file] of Object.entries(files)) sql[name] = await readFile(new URL("../database/" + file, import.meta.url), "utf8");
const credits = JSON.parse(await readFile(new URL("../public/examples/hd/credits.json", import.meta.url), "utf8"));
const database = "art_showcase_demo_test_" + randomBytes(8).toString("hex");
assert.match(database, /^art_showcase_demo_test_[a-f0-9]{16}$/);
const admin = new pg.Pool({ connectionTimeoutMillis: 5000 });
let created = false, pool;
const same = (actual, expected, message) => assert.ok(JSON.stringify(actual) === JSON.stringify(expected), message);
const snapshot = async () => (await pool.query(sql.snapshot)).rows[0].data;
const byId = (rows, id) => rows.find((row) => row.id === id);
const tagsFor = (data, id) => data.artwork_tags.filter((row) => row.artwork_id === id).map((row) => byId(data.tags, row.tag_id).name).sort();
const untouched = ["users", "sessions", "auth_limits", "likes", "favorites", "comments", "reports", "submissions", "winners"];
function checkRelations(before, after) {
  for (const table of untouched) same(after[table], before[table], "Migrasi mengubah data " + table + ".");
  for (const row of before.categories) same(byId(after.categories, row.id), row, "Kategori yang sudah ada tertimpa.");
  for (const row of before.tags) same(byId(after.tags, row.id), row, "Tag yang sudah ada tertimpa.");
  same(after.artworks.map(({ id, member_id, created_at }) => ({ id, member_id, created_at })), before.artworks.map(({ id, member_id, created_at }) => ({ id, member_id, created_at })), "Identitas atau pemilik karya berubah.");
  const challengeMetadata = (data) => data.challenges.map(({ banner_path, updated_at, ...row }) => row);
  same(challengeMetadata(after), challengeMetadata(before), "Migrasi mengubah isi atau jadwal challenge.");
}
function checkArtwork(data, item) {
  const artwork = byId(data.artworks, item.seedId);
  assert.ok(artwork, "Karya demo hilang.");
  same({ title: artwork.title, description: artwork.description, filePath: artwork.file_path, mediaType: artwork.media_type, category: byId(data.categories, artwork.category_id)?.name },
    { title: item.title, description: item.description, filePath: item.filePath, mediaType: "image/webp", category: item.category }, "Isi karya demo tidak sesuai gambar dan kredit.");
  same(tagsFor(data, item.seedId), [...item.tags].sort(), "Tags karya tidak sesuai gambar.");
}
async function migrate(text = sql.migration) {
  const client = await pool.connect();
  try { return await client.query(text); }
  catch (error) { await client.query("ROLLBACK");throw error; }
  finally { client.release(); }
}
function updated(results) {
  const summary = (Array.isArray(results) ? results : [results]).find((result) => Object.hasOwn(result.rows[0] || {}, "artworks_updated"));
  assert.ok(summary, "Ringkasan migrasi tidak ditemukan.");
  return summary.rows[0].artworks_updated;
}
async function checkImmutable() {
  await assert.rejects(pool.query(sql.immutable, ["/uploads/00000000-0000-4000-8000-000000000099.webp", 1]), (error) => error.code === "23514", "Penggantian file lewat UPDATE masih harus ditolak.");
}
try {
  await admin.query(sql.create.replace("{{database}}", '"' + database + '"'));created = true;
  pool = new pg.Pool({ database, connectionTimeoutMillis: 5000 });
  await pool.query(sql.schema);await pool.query(sql.seed);
  const fresh = await snapshot();
  same(Object.keys(fresh).length, 14, "Jumlah tabel berubah.");
  same(fresh.users.length, 7, "Jumlah akun demo keliru.");
  same(fresh.artworks.length, 6, "Jumlah karya demo keliru.");
  same(fresh.challenges.length, 3, "Jumlah challenge demo keliru.");
  same(fresh.submissions.length, 4, "Jumlah submisi demo keliru.");
  same(fresh.winners.length, 2, "Jumlah pemenang demo keliru.");
  assert.ok(await bcrypt.compare("RuangKarya2026!", fresh.users.find((user) => user.role === "admin").password_hash), "Password Admin seed tidak dapat digunakan.");
  for (const item of credits) checkArtwork(fresh, item);
  await pool.query(sql.schema);await pool.query(sql.seed);
  same(await snapshot(), fresh, "Menjalankan ulang schema dan seed mengubah atau menggandakan data.");
  await checkImmutable();
  console.log("Lulus: schema dan seed baru dapat dijalankan dua kali; akun, karya, kategori, tags, submisi, dan pemenang tersedia.");

  await pool.query(sql.legacy);const legacy = await snapshot();
  same(updated(await migrate()), 6, "Enam karya seed lama seharusnya diperbarui.");
  const migrated = await snapshot();checkRelations(legacy, migrated);
  for (const item of credits) checkArtwork(migrated, item);
  same(migrated.challenges.map((row) => row.banner_path), [credits[0].filePath, credits[2].filePath, credits[3].filePath], "Banner challenge lama belum diperbarui.");
  await checkImmutable();
  same(updated(await migrate()), 0, "Migrasi kedua seharusnya tidak memperbarui karya.");
  same(await snapshot(), migrated, "Migrasi kedua mengubah data yang sudah diperbarui.");
  console.log("Lulus: migrasi enam karya, banner, dan tags menjaga akun serta seluruh relasi; pengulangan menghasilkan nol perubahan.");

  await pool.query(sql.legacy);await pool.query(sql.custom);const custom = await snapshot();
  same(byId(custom.categories, 6).name, "Arsip Pribadi", "Fixture kategori pribadi belum terbentuk.");
  same(updated(await migrate()), 3, "Hanya tiga karya contoh yang masih asli yang boleh diubah.");
  const protectedData = await snapshot();checkRelations(custom, protectedData);
  for (const id of [1, 3, 4]) checkArtwork(protectedData, credits.find((item) => item.seedId === id));
  for (const id of [2, 5, 6]) {
    same(byId(protectedData.artworks, id), byId(custom.artworks, id), "Karya dengan judul, berkas, atau pemilik berbeda tertimpa.");
    same(tagsFor(protectedData, id), tagsFor(custom, id), "Tags karya yang dikecualikan ikut berubah.");
  }
  same(byId(protectedData.challenges, 3), byId(custom.challenges, 3), "Banner unggahan pribadi tertimpa.");
  same(protectedData.challenges.slice(0, 2).map((row) => row.banner_path), [credits[0].filePath, credits[2].filePath], "Dua banner asli tidak diperbarui.");
  await checkImmutable();
  console.log("Lulus: judul kustom, jalur uploads, pemilik berbeda, banner pribadi, serta kategori yang sudah ada tetap dipertahankan.");

  await pool.query(sql.legacy);const beforeFailure = await snapshot();
  assert.match(sql.migration, /COMMIT;\s*$/i, "Migrasi harus menutup transaksi.");
  const broken = sql.migration.replace(/COMMIT;\s*$/i, sql.error + "\nCOMMIT;");
  await assert.rejects(migrate(broken), (error) => error.code === "22012", "Kesalahan SQL seharusnya membatalkan migrasi.");
  same(await snapshot(), beforeFailure, "Migrasi gagal meninggalkan sebagian perubahan data.");
  await checkImmutable();
  same(updated(await migrate()), 6, "Migrasi normal harus tetap dapat dijalankan sesudah rollback.");
  console.log("Lulus: kesalahan SQL membatalkan seluruh perubahan dan proteksi file tetap aktif setelah rollback.");
} finally {
  if (pool) await pool.end();
  try { if (created) await admin.query(sql.drop.replace("{{database}}", '"' + database + '"')); }
  finally { await admin.end(); }
}
