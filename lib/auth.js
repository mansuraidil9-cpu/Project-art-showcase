import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser, SESSION_COOKIE, cookieOptions, userDestination } from "./session.js";

export async function getCurrentUser() {
  const jar = await cookies();
  return getSessionUser(jar.get(SESSION_COOKIE)?.value);
}

export async function requireUser({ roles = [], allowUnapproved = false } = {}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!allowUnapproved && user.role === "curator" && user.curator_status !== "approved") {
    redirect("/curator-status");
  }
  if (roles.length && !roles.includes(user.role)) redirect(userDestination(user));
  return user;
}

export async function setSessionCookie(session) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, session.token, { ...cookieOptions, expires: session.expires });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

