import "server-only";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { query } from "./db.js";

export const SESSION_COOKIE = "ruang_karya_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 7;

function sessionKey() {
  const value = process.env.SESSION_SECRET || "";
  if (new TextEncoder().encode(value).length < 32) {
    throw new Error("SESSION_SECRET harus diisi dengan nilai acak minimal 32 byte.");
  }
  return new TextEncoder().encode(value);
}

export function tokenHash(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function limitKey(scope, value) {
  return createHmac("sha256", sessionKey()).update(scope + ":" + value).digest("hex");
}

export async function createSession(user, client) {
  const id = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_SECONDS * 1000);
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setJti(id)
    .setIssuedAt()
    .setIssuer("ruang-karya")
    .setAudience("ruang-karya-web")
    .setExpirationTime(Math.floor(expires.getTime() / 1000))
    .sign(sessionKey());
  await query("sessionCreate", [tokenHash(id), user.id, expires], client);
  return { token, expires };
}

export async function decodeSession(token) {
  if (!token) return null;
  const key = sessionKey();
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      issuer: "ruang-karya",
      audience: "ruang-karya-web",
    });
    if (!/^[1-9]\d*$/.test(payload.sub || "") || !/^[a-f0-9]{64}$/.test(payload.jti || "")) return null;
    const userId = Number(payload.sub);
    if (!Number.isSafeInteger(userId) || userId > 2147483647) return null;
    return { userId, hash: tokenHash(payload.jti) };
  } catch {
    return null;
  }
}

export async function getSessionUser(token, client = null, lock = false) {
  const session = await decodeSession(token);
  if (!session) return null;
  const result = await query(lock ? "sessionFindLocked" : "sessionFind", [session.hash, session.userId], client);
  return result.rows[0] || null;
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

