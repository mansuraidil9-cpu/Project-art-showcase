"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query, withTransaction } from "@/lib/db";
import { getCurrentUser, requireUser, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { createSession, decodeSession, getSessionUser, limitKey, SESSION_COOKIE, userDestination } from "@/lib/session";
import { normalizeEmail, textField, validEmail, validPasswordLength } from "@/lib/validation";

function failure(message, fields = {}, values = {}) {
  return { message, fields, values };
}

function logFailure(label, error) {
  console.error(label, error.code || "AUTH_ERROR");
}

async function allowAttempt(scope, value, maximum = 10) {
  const key = limitKey(scope, value);
  const result = await query("limitAttempt", [key]);
  return { key, allowed: result.rows[0].attempts <= maximum };
}

export async function registerAction(previous, form) {
  const existing = await getCurrentUser();
  if (existing) redirect(userDestination(existing));

  const displayName = textField(form, "displayName").trim();
  const email = normalizeEmail(textField(form, "email"));
  const password = textField(form, "password");
  const confirmation = textField(form, "confirmation");
  const role = textField(form, "role");
  const fields = {};
  const values = { displayName: displayName.slice(0, 80), email: email.slice(0, 254), role };

  if (displayName.length < 2 || displayName.length > 80) fields.displayName = "Nama tampilan harus 2–80 karakter.";
  if (!validEmail(email)) fields.email = "Masukkan alamat email yang valid.";
  if (!validPasswordLength(password)) fields.password = "Password minimal 10 karakter dan maksimal 72 byte.";
  if (password !== confirmation) fields.confirmation = "Konfirmasi password belum sama.";
  if (!["member", "curator"].includes(role)) fields.role = "Pilih Member atau Curator.";
  if (Object.keys(fields).length) return failure("Periksa kembali isian berikut.", fields, values);

  let user;
  try {
    const attempt = await allowAttempt("register", email, 5);
    if (!attempt.allowed) return failure("Terlalu banyak percobaan. Coba kembali dalam 15 menit.", {}, values);
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await withTransaction(async (client) => {
      const created = (await query("userCreate", [email, passwordHash, displayName, role], client)).rows[0];
      const session = await createSession(created, client);
      await query("sessionCleanup", [], client);
      return { user: created, session };
    });
    user = result.user;
    await setSessionCookie(result.session);
  } catch (error) {
    if (error.code === "23505" && error.constraint === "users_email_unique") {
      return failure("Email sudah terdaftar. Gunakan email lain atau masuk.", { email: "Email ini sudah digunakan." }, values);
    }
    logFailure("Pendaftaran gagal:", error);
    return failure("Pendaftaran belum berhasil. Periksa konfigurasi aplikasi atau coba lagi.", {}, values);
  }
  redirect(userDestination(user));
}

export async function loginAction(previous, form) {
  const existing = await getCurrentUser();
  if (existing) redirect(userDestination(existing));
  const email = normalizeEmail(textField(form, "email"));
  const password = textField(form, "password");
  const values = { email: email.slice(0, 254) };
  const fields = {};
  if (!validEmail(email)) fields.email = "Masukkan alamat email yang valid.";
  if (!password || new TextEncoder().encode(password).length > 72) fields.password = "Masukkan password yang valid.";
  if (Object.keys(fields).length) return failure("Periksa kembali isian berikut.", fields, values);

  let user;
  try {
    const attempt = await allowAttempt("login", email);
    if (!attempt.allowed) return failure("Terlalu banyak percobaan. Coba kembali dalam 15 menit.", {}, values);
    const result = await withTransaction(async (client) => {
      const account = (await query("userEmailLock", [email], client)).rows[0];
      // Kunci akun menyelaraskan login dengan pencabutan sesi saat password berubah.
      const fallback = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6Ttxm4bkFI.l8eDjwqf9tCBX1yF1a";
      if (!(await bcrypt.compare(password, account?.password_hash || fallback)) || !account) return null;
      const created = await createSession(account, client);
      await query("limitDelete", [attempt.key], client);
      await query("sessionCleanup", [], client);
      return { user: account, session: created };
    });
    if (!result) return failure("Email atau password tidak cocok.", {}, values);
    user = result.user;
    await setSessionCookie(result.session);
  } catch (error) {
    logFailure("Login gagal:", error);
    return failure("Login belum berhasil. Periksa konfigurasi aplikasi atau coba lagi.", {}, values);
  }
  redirect(userDestination(user));
}

export async function logoutAction() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await decodeSession(token);
  if (session) await query("sessionDelete", [session.hash]);
  await clearSessionCookie();
  redirect("/login");
}

export async function deleteRejectedAccountAction(previous, form) {
  await requireUser({ roles: ["curator"], allowUnapproved: true });
  const password = textField(form, "password");
  if (textField(form, "confirmation") !== "HAPUS") {
    return failure("Ketik HAPUS untuk mengonfirmasi penghapusan.");
  }
  if (!password || new TextEncoder().encode(password).length > 72) return failure("Masukkan password akunmu.");
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  try {
    const result = await withTransaction(async (client) => {
      const user = await getSessionUser(token, client, true);
      if (!user || user.role !== "curator" || user.curator_status !== "rejected") return "forbidden";
      const attempt = await allowAttempt("delete", String(user.id), 5);
      if (!attempt.allowed) return "limited";
      const account = (await query("accountPassword", [user.id], client)).rows[0];
      if (!account || !(await bcrypt.compare(password, account.password_hash))) return "password";
      const removed = await query("accountDelete", [user.id], client);
      return removed.rowCount === 1 ? "deleted" : "forbidden";
    });
    if (result === "forbidden") return failure("Hanya Curator yang ditolak yang dapat menghapus akun melalui halaman ini.");
    if (result === "limited") return failure("Terlalu banyak percobaan. Coba kembali dalam 15 menit.");
    if (result === "password") return failure("Password tidak cocok. Akun belum dihapus.");
  } catch (error) {
    logFailure("Penghapusan akun gagal:", error);
    return failure("Akun belum dapat dihapus. Coba kembali.");
  }
  await clearSessionCookie();
  redirect("/login?account=deleted");
}

