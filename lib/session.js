import "server-only";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { query } from "./db.js";
import { SESSION_SECONDS, sessionKey, signSessionToken, verifySessionToken } from "./session-token.js";

export { SESSION_COOKIE, SESSION_SECONDS } from "./session-token.js";

export function tokenHash(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function limitKey(scope, value) {
  return createHmac("sha256", sessionKey()).update(scope + ":" + value).digest("hex");
}

export async function createSession(user, client) {
  const id = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_SECONDS * 1000);
  const token = await signSessionToken(user.id, id, expires);
  await query("sessionCreate", [tokenHash(id), user.id, expires], client);
  return { token, expires };
}

export async function decodeSession(token) {
  const session = await verifySessionToken(token);
  return session ? { userId: session.userId, hash: tokenHash(session.sessionId) } : null;
}

export async function getSessionUser(token, client = null, lock = false) {
  const session = await decodeSession(token);
  if (!session) return null;
  const result = await query(lock ? "sessionFindLocked" : "sessionFind", [session.hash, session.userId], client);
  if (!result.rowCount) return null;
  if (!lock) return result.rows[0];
  // Sesi bisa kedaluwarsa selama request menunggu kunci akun.
  if (!(await decodeSession(token))) return null;
  return (await query("sessionFind", [session.hash, session.userId], client)).rows[0] || null;
}

export function userDestination(user) {
  if (user.role === "curator" && user.curator_status !== "approved") return "/curator-status";
  return "/dashboard/" + user.role;
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

