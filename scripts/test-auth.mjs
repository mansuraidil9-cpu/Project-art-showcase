import nextEnv from "@next/env";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

nextEnv.loadEnvConfig(process.cwd());
const { query, withTransaction } = await import("../lib/db.js");
const { createSession, getSessionUser, decodeSession, limitKey, userDestination } = await import("../lib/session.js");
const { validEmail, validPasswordLength } = await import("../lib/validation.js");

const sql = {};
for (const name of ["account", "cleanup", "status", "session-count", "expire-token"]) {
  sql[name] = await readFile(new URL("../database/tests/auth-" + name + ".sql", import.meta.url), "utf8");
}
const marker = randomBytes(6).toString("hex");
const email = "uji-auth-" + marker + "@example.test";
const pass = "UjiRuangKarya2026!";
const hash = await bcrypt.hash(pass, 12);
const key = limitKey("test", marker);
let user;
try {
  assert(validEmail("nama@example.test"));
  assert(!validEmail("nama' OR 1=1--"));
  assert(!validPasswordLength(" ".repeat(12)));
  assert(!validPasswordLength("é".repeat(37)));
  assert(validPasswordLength(pass));
  await assert.rejects(withTransaction(async (client) => {
    const created = (await query("userCreate", [email, hash, "Uji Transaksi", "curator"], client)).rows[0];
    await createSession(created, client);
    throw new Error("Batalkan pendaftaran");
  }), /Batalkan pendaftaran/);
  await withTransaction(async (client) => assert.equal((await client.query(sql.account, [email])).rowCount, 0));

  const registered = await withTransaction(async (client) => {
    const created = (await query("userCreate", [email, hash, "Uji Autentikasi", "curator"], client)).rows[0];
    return { user: created, session: await createSession(created, client) };
  });
  user = registered.user;
  assert.equal(user.curator_status, "pending");
  assert.equal(userDestination(user), "/curator-status");
  assert.equal((await getSessionUser(registered.session.token)).id, user.id);
  await withTransaction(async (client) => {
    const account = (await client.query(sql.account, [email])).rows[0];
    assert(await bcrypt.compare(pass, account.password_hash));
    await client.query(sql.status, [email, "approved", null]);
  });
  assert.equal(userDestination(await getSessionUser(registered.session.token)), "/dashboard/curator");
  const decoded = await decodeSession(registered.session.token);
  await query("sessionDelete", [decoded.hash]);
  assert.equal(await getSessionUser(registered.session.token), null);

  const expiredDb = await withTransaction((client) => createSession(user, client));
  await withTransaction(async (client) => {
    const decoded = await decodeSession(expiredDb.token);
    await client.query(sql["expire-token"], [decoded.hash]);
  });
  assert.equal(await getSessionUser(expiredDb.token), null);
  const expiredJwt = await new SignJWT({}).setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id)).setJti("a".repeat(64)).setIssuer("ruang-karya")
    .setAudience("ruang-karya-web").setExpirationTime(Math.floor(Date.now() / 1000) - 10)
    .sign(new TextEncoder().encode(process.env.SESSION_SECRET));
  assert.equal(await getSessionUser(expiredJwt), null);
  assert.equal(await getSessionUser("token-palsu"), null);

  const session = await withTransaction((client) => createSession(user, client));
  await withTransaction(async (client) => {
    await client.query(sql.status, [email, "rejected", "Penolakan untuk pengujian."]);
    assert.equal((await query("accountDelete", [user.id], client)).rowCount, 1);
    assert.equal((await client.query(sql["session-count"], [user.id])).rows[0].total, 0);
  });
  assert.equal(await getSessionUser(session.token), null);
  const attempts = await Promise.all(Array.from({ length: 12 }, () => query("limitAttempt", [key])));
  assert.deepEqual(attempts.map((result) => result.rows[0].attempts).sort((a, b) => a - b), Array.from({ length: 12 }, (_, i) => i + 1));
  console.log("Lulus: validasi, rollback register+sesi, bcrypt, JWT, pencabutan sesi, status terkini, CASCADE, dan counter atomik.");
} finally {
  if (globalThis.artShowcasePool) {
    await withTransaction(async (client) => {
      await client.query(sql.cleanup, [email]);
      await query("limitDelete", [key], client);
    });
    await globalThis.artShowcasePool.end();
  }
}

