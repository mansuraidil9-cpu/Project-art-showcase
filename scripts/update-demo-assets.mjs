import nextEnv from "@next/env";
import pg from "pg";
import { readFile, access } from "node:fs/promises";

nextEnv.loadEnvConfig(process.cwd());
const client = new pg.Client({ connectionTimeoutMillis: 5000 });
let connected = false;
try {
  if (!process.env.PGPASSWORD) throw new Error("Isi PGPASSWORD di .env.local terlebih dahulu.");
  const assets = JSON.parse(await readFile(new URL("../public/examples/hd/credits.json", import.meta.url), "utf8"));
  await Promise.all(assets.map((asset) => access(new URL("../public" + asset.filePath, import.meta.url))));
  const sql = await readFile(new URL("../database/migrations/003-demo-gallery.sql", import.meta.url), "utf8");
  await client.connect();
  connected = true;
  const results = await client.query(sql);
  const summary = results.find((result) => result.rows[0]?.artworks_updated !== undefined);
  const banners = results.filter((result) => result.command === "UPDATE").reduce((total, result) => total + result.rowCount, 0);
  console.log("Karya contoh diperbarui:", summary?.rows[0].artworks_updated || 0);
  console.log("Banner challenge diperbarui:", banners);
  console.log("Selesai. Karya unggahan tidak ditimpa; menjalankan ulang tidak menggandakan data.");
} catch (error) {
  if (connected) await client.query("ROLLBACK").catch(() => {});
  console.error("Pembaruan contoh gagal:", error.code || error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
