import "server-only";
import bcrypt from "bcryptjs";
import { query } from "./db.js";
import { MemberError, getMember, withMemberTransaction } from "./member.js";
import { limitKey } from "./session.js";
import { removeUploads, saveProfileImage } from "./uploads.js";
import { normalizeEmail, validEmail, validPasswordLength } from "./validation.js";

function profileValues(values) {
  const fields = {};
  const displayName = typeof values.displayName === "string" ? values.displayName.trim() : "";
  const bio = typeof values.bio === "string" ? values.bio.trim() : "";
  if (displayName.length < 2 || displayName.length > 80) fields.displayName = "Nama tampilan harus 2–80 karakter.";
  if (bio.length > 500) fields.bio = "Bio maksimal 500 karakter.";
  const links = {};
  for (const name of ["website", "instagram", "behance"]) {
    const value = typeof values[name] === "string" ? values[name].trim() : "";
    links[name] = null;
    if (!value) continue;
    try {
      const url = new URL(value);
      if (value.length > 2048 || !["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error();
      const domain = name === "instagram" ? "instagram.com" : "behance.net";
      if (name !== "website" && url.hostname !== domain && !url.hostname.endsWith("." + domain)) throw new Error();
      links[name] = url.href;
    } catch { fields[name] = name === "website" ? "Gunakan URL lengkap berawalan https:// atau http://, maksimal 2.048 karakter." : "Gunakan URL lengkap dari " + (name === "instagram" ? "instagram.com" : "behance.net") + "."; }
  }
  if (Object.keys(fields).length) throw new MemberError("VALIDATION", "Periksa kembali isian profilmu.", fields);
  return { displayName, bio, ...links };
}

export async function updateProfile(token, values, file, removePhoto = "") {
  let uploaded;
  let result;
  try {
    result = await withMemberTransaction(token, async (client, user) => {
      const clean = profileValues(values);
      if (!["", "yes"].includes(removePhoto)) throw new MemberError("VALIDATION", "Pilihan foto tidak valid.");
      const hasFile = file && file.size > 0;
      if (hasFile && removePhoto === "yes") throw new MemberError("VALIDATION", "Pilih foto baru atau hapus foto lama, salah satu saja.", { file: "Batalkan pilihan hapus foto jika ingin mengunggah foto baru." });
      const old = (await query("profileOwn", [user.id], client)).rows[0];
      if (hasFile) uploaded = await saveProfileImage(file);
      const avatar = uploaded || (removePhoto === "yes" ? null : old.avatar_path);
      await query("profileUpdate", [user.id, clean.displayName, clean.bio, clean.website, clean.instagram, clean.behance, avatar], client);
      return { id: user.id, oldPhoto: avatar !== old.avatar_path ? old.avatar_path : null };
    });
  } catch (error) {
    if (uploaded) await removeUploads([uploaded]);
    throw error;
  }
  const failed = await removeUploads([result.oldPhoto]);
  return { id: result.id, cleanupFailed: Boolean(failed) };
}

async function accountAttempt(token, scope) {
  // Batas percobaan disimpan sebelum transaksi agar kegagalan password tetap dihitung.
  const user = await getMember(token);
  const key = limitKey(scope, String(user.id));
  const attempt = (await query("limitAttempt", [key])).rows[0];
  if (attempt.attempts > 5) throw new MemberError("RATE_LIMIT", "Terlalu banyak percobaan. Coba kembali dalam 15 menit.");
  return key;
}

async function verifyPassword(client, user, password) {
  const account = (await query("profilePrivateLock", [user.id], client)).rows[0];
  if (typeof password !== "string" || !password || new TextEncoder().encode(password).length > 72 || !(await bcrypt.compare(password, account.password_hash))) {
    throw new MemberError("PASSWORD", "Password saat ini tidak cocok.", { currentPassword: "Masukkan password akun yang sedang digunakan." });
  }
  return account;
}

export async function changeEmail(token, value, currentPassword) {
  const key = await accountAttempt(token, "change-email");
  try {
    return await withMemberTransaction(token, async (client, user) => {
      const email = normalizeEmail(typeof value === "string" ? value : "");
      if (!validEmail(email)) throw new MemberError("VALIDATION", "Masukkan email yang valid.", { email: "Alamat email belum valid." });
      const account = await verifyPassword(client, user, currentPassword);
      if (email === account.email) throw new MemberError("VALIDATION", "Email baru masih sama dengan email saat ini.", { email: "Gunakan email yang berbeda." });
      await query("profileEmailUpdate", [user.id, email], client);
      await query("sessionsDeleteUser", [user.id], client);
      await query("limitDelete", [key], client);
      return { id: user.id };
    });
  } catch (error) {
    if (error.code === "23505" && error.constraint === "users_email_unique") throw new MemberError("EMAIL_TAKEN", "Email sudah digunakan oleh akun lain.", { email: "Gunakan email yang lain." });
    throw error;
  }
}

export async function changePassword(token, currentPassword, password, confirmation) {
  const key = await accountAttempt(token, "change-password");
  return withMemberTransaction(token, async (client, user) => {
    const fields = {};
    if (typeof password !== "string" || !validPasswordLength(password)) fields.password = "Password minimal 10 karakter dan maksimal 72 byte.";
    if (password !== confirmation) fields.confirmation = "Konfirmasi password belum sama.";
    if (Object.keys(fields).length) throw new MemberError("VALIDATION", "Periksa kembali password baru.", fields);
    await verifyPassword(client, user, currentPassword);
    if (password === currentPassword) throw new MemberError("VALIDATION", "Gunakan password baru yang berbeda.", { password: "Password baru masih sama dengan password saat ini." });
    const hash = await bcrypt.hash(password, 12);
    await query("profilePasswordUpdate", [user.id, hash], client);
    await query("sessionsDeleteUser", [user.id], client);
    await query("limitDelete", [key], client);
    return { id: user.id };
  });
}
