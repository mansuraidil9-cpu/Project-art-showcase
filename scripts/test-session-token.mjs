import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { SignJWT } from "jose";
import { signSessionToken, verifySessionToken } from "../lib/session-token.js";

// Pengujian token berjalan tanpa konfigurasi atau koneksi database.
process.env.PGPASSWORD = "";
process.env.SESSION_SECRET = randomBytes(32).toString("hex");
const key = new TextEncoder().encode(process.env.SESSION_SECRET);
const sessionId = randomBytes(32).toString("hex");
const future = new Date(Date.now() + 60000);
const token = await signSessionToken(42, sessionId, future);

assert.deepEqual(await verifySessionToken(token), { userId: 42, sessionId });
assert.equal(await verifySessionToken(), null);
assert.equal(await verifySessionToken("token-palsu"), null);
const altered = token.slice(0, 20) + (token[20] === "a" ? "b" : "a") + token.slice(21);
assert.equal(await verifySessionToken(altered), null);
const expired = await signSessionToken(42, sessionId, new Date(Date.now() - 60000));
assert.equal(await verifySessionToken(expired), null);

const wrongIssuer = await new SignJWT({}).setProtectedHeader({ alg: "HS256" })
  .setSubject("42").setJti(sessionId).setIssuer("aplikasi-lain")
  .setAudience("ruang-karya-web").setExpirationTime("1m").sign(key);
assert.equal(await verifySessionToken(wrongIssuer), null);
const wrongAudience = await new SignJWT({}).setProtectedHeader({ alg: "HS256" })
  .setSubject("42").setJti(sessionId).setIssuer("ruang-karya")
  .setAudience("aplikasi-lain").setExpirationTime("1m").sign(key);
assert.equal(await verifySessionToken(wrongAudience), null);
const wrongKey = await new SignJWT({}).setProtectedHeader({ alg: "HS256" })
  .setSubject("42").setJti(sessionId).setIssuer("ruang-karya")
  .setAudience("ruang-karya-web").setExpirationTime("1m")
  .sign(randomBytes(32));
assert.equal(await verifySessionToken(wrongKey), null);
assert.equal(await verifySessionToken(await signSessionToken(0, sessionId, future)), null);
assert.equal(await verifySessionToken(await signSessionToken(42, "id-salah", future)), null);

process.env.SESSION_SECRET = "";
await assert.rejects(verifySessionToken(token), /SESSION_SECRET/);
console.log("Lulus: verifikasi JWT tanpa database, token palsu/kedaluwarsa, issuer, audience, tanda tangan, dan konfigurasi kunci.");
