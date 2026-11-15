import "server-only";
import pg from "pg";
import { readFile } from "node:fs/promises";
import path from "node:path";

const globalDb = globalThis;

function getPool() {
  if (!process.env.PGPASSWORD) {
    throw new Error("Isi PGPASSWORD di .env.local untuk menghubungkan database.");
  }
  if (!globalDb.artShowcasePool) {
    globalDb.artShowcasePool = new pg.Pool({
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || "art_showcase",
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD,
      max: 10,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    });
    globalDb.artShowcasePool.on("error", (error) => {
      console.error("Koneksi database terputus:", error.code);
    });
  }
  return globalDb.artShowcasePool;
}

const queryFiles = {
  platform: "platform.sql",
  preview: "preview.sql",
  connection: "connection.sql",
  userCreate: "auth/user-create.sql",
  userEmail: "auth/user-email.sql",
  sessionCreate: "auth/session-create.sql",
  sessionFind: "auth/session-find.sql",
  sessionFindLocked: "auth/session-find-locked.sql",
  sessionDelete: "auth/session-delete.sql",
  sessionCleanup: "auth/session-cleanup.sql",
  accountPassword: "auth/account-password.sql",
  accountDelete: "auth/account-delete.sql",
  limitAttempt: "auth/limit-attempt.sql",
  limitDelete: "auth/limit-delete.sql",
};
const sqlCache = new Map();

export async function readQuery(name) {
  const file = queryFiles[name];
  if (!file) throw new Error("Nama query tidak terdaftar.");
  if (!sqlCache.has(name)) {
    sqlCache.set(name, await readFile(path.join(process.cwd(), "database", "queries", file), "utf8"));
  }
  return sqlCache.get(name);
}

export async function query(name, values = [], client = null) {
  const sql = await readQuery(name);
  return (client || getPool()).query(sql, values);
}

export async function withTransaction(callback) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

