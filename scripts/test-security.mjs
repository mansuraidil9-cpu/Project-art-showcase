import nextEnv from "@next/env";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { SignJWT } from "jose";

nextEnv.loadEnvConfig(process.cwd());
const { query, withTransaction } = await import("../lib/db.js");
const { getSessionUser, tokenHash } = await import("../lib/session.js");
const { sessionKey, signSessionToken, verifySessionToken } = await import("../lib/session-token.js");
const sql = {};
for (const [name, file] of Object.entries({ cleanup: "security-cleanup", lock: "security-user-lock", waits: "security-lock-waits", passed: "challenge-clock-passed" })) sql[name] = await readFile(new URL("../database/tests/" + file + ".sql", import.meta.url), "utf8");
const marker = randomBytes(6).toString("hex"), failures = [];
let user;
async function check(name, callback) { try { await callback();console.log("Lulus:", name); } catch (error) { failures.push(name);console.error("Gagal:", name, error.message.split("\n")[0]); } }
async function until(predicate) { for (let i = 0; i < 200; i++) { if (await predicate()) return;await new Promise((resolve) => setTimeout(resolve, 25)); }throw new Error("Kondisi antrean pengujian tidak tercapai"); }
async function blockedExpiry(kind) {
  const sessionId = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + (kind === "jwt" ? 2500 : 60000));
  const databaseExpires = new Date(Date.now() + (kind === "database" ? 2500 : 60000));
  const token = await signSessionToken(user.id, sessionId, expires);
  await query("sessionCreate", [tokenHash(sessionId), user.id, databaseExpires]);
  const blocker = await globalThis.artShowcasePool.connect();let pending;
  try {
    await blocker.query("BEGIN");await blocker.query(sql.lock, [user.id]);
    pending = withTransaction((client) => getSessionUser(token, client, true));pending.catch(() => {});
    await until(async () => (await withTransaction((client) => client.query(sql.waits))).rows[0].total > 0);
    const deadline = kind === "jwt" ? new Date(Math.floor(expires.getTime() / 1000) * 1000) : databaseExpires;
    await until(async () => (await withTransaction((client) => client.query(sql.passed, [deadline]))).rows[0].passed);
    await blocker.query("COMMIT");
    if ((await pending) !== null) throw new Error("Sesi kedaluwarsa masih diterima setelah menunggu kunci.");
  } finally { await blocker.query("ROLLBACK");blocker.release();if (pending) await Promise.allSettled([pending]);await query("sessionDelete", [tokenHash(sessionId)]); }
}
try {
  user = (await query("userCreate", ["uji-security-" + marker + "@example.test", await bcrypt.hash("UjiSecurity2026!", 12), "Pengguna Uji Keamanan", "member"])).rows[0];
  await check("JWT tanpa masa berlaku ditolak", async () => {
    const token = await new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(String(user.id)).setJti(randomBytes(32).toString("hex")).setIssuedAt().setIssuer("ruang-karya").setAudience("ruang-karya-web").sign(sessionKey());
    assert.equal(await verifySessionToken(token), null);
  });
  await check("JWT tanpa waktu penerbitan ditolak", async () => {
    const token = await new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(String(user.id)).setJti(randomBytes(32).toString("hex")).setExpirationTime("1 hour").setIssuer("ruang-karya").setAudience("ruang-karya-web").sign(sessionKey());
    assert.equal(await verifySessionToken(token), null);
  });
  await check("Masa berlaku sesi database diperiksa setelah antrean kunci", () => blockedExpiry("database"));
  await check("Masa berlaku JWT diperiksa setelah antrean kunci", () => blockedExpiry("jwt"));
  if (failures.length) process.exitCode = 1;
} finally {
  if (globalThis.artShowcasePool) { if (user) await withTransaction((client) => client.query(sql.cleanup, [user.id]));await globalThis.artShowcasePool.end(); }
}
