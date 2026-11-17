import "server-only";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ruang_karya_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 7;

export function sessionKey() {
  const value = process.env.SESSION_SECRET || "";
  if (new TextEncoder().encode(value).length < 32) {
    throw new Error("SESSION_SECRET harus diisi dengan nilai acak minimal 32 byte.");
  }
  return new TextEncoder().encode(value);
}

export async function signSessionToken(userId, sessionId, expires) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setJti(sessionId)
    .setIssuedAt()
    .setIssuer("ruang-karya")
    .setAudience("ruang-karya-web")
    .setExpirationTime(Math.floor(expires.getTime() / 1000))
    .sign(sessionKey());
}

export async function verifySessionToken(token) {
  if (!token) return null;
  const key = sessionKey();
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      issuer: "ruang-karya",
      audience: "ruang-karya-web",
      requiredClaims: ["sub", "jti", "iat", "exp"],
    });
    if (!/^[1-9]\d*$/.test(payload.sub || "") || !/^[a-f0-9]{64}$/.test(payload.jti || "")) return null;
    const userId = Number(payload.sub);
    if (!Number.isSafeInteger(userId) || userId > 2147483647) return null;
    return { userId, sessionId: payload.jti };
  } catch {
    return null;
  }
}
