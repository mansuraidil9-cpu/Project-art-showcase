import nextEnv from "@next/env";
import pg from "pg";
import { readFile } from "node:fs/promises";
nextEnv.loadEnvConfig(process.cwd());
const pool = new pg.Pool({ connectionTimeoutMillis: 5000 });
try {
  const sql = await readFile(new URL("../database/queries/connection.sql", import.meta.url), "utf8");
  const { rows } = await pool.query(sql);
  console.log("Database:", rows[0].database);
  console.log("Server:", rows[0].version);
} catch (error) {
  console.error("Koneksi gagal. Periksa PostgreSQL dan .env.local. Kode:", error.code || "KONFIGURASI");
  process.exitCode = 1;
} finally {
  await pool.end();
}

