import "server-only";
import { query, withTransaction } from "./db.js";
import { getSessionUser } from "./session.js";
import { normalizeEmail } from "./validation.js";

export class AdminError extends Error {
  constructor(code, message, fields = {}) {
    super(message);
    this.code = code;
    this.fields = fields;
  }
}

export function positiveId(value) {
  const text = String(value ?? "");
  const id = Number(text);
  if (!/^[1-9]\d*$/.test(text) || !Number.isSafeInteger(id) || id > 2147483647) {
    throw new AdminError("INVALID_ID", "ID data tidak valid.");
  }
  return id;
}

export function categoryInput(values) {
  const name = typeof values.name === "string" ? values.name.trim().replace(/\s+/g, " ") : "";
  const description = typeof values.description === "string" ? values.description.trim() : "";
  const fields = {};
  if (!name || name.length > 60) fields.name = "Nama kategori wajib diisi, maksimal 60 karakter.";
  if (description.length > 250) fields.description = "Deskripsi maksimal 250 karakter.";
  if (Object.keys(fields).length) throw new AdminError("VALIDATION", "Periksa kembali isian kategori.", fields);
  return { name, description };
}

async function withAdminTransaction(token, callback) {
  return withTransaction(async (client) => {
    const actor = await getSessionUser(token, client, true);
    if (!actor) throw new AdminError("UNAUTHORIZED", "Sesi sudah berakhir. Silakan masuk kembali.");
    if (actor.role !== "admin") throw new AdminError("FORBIDDEN", "Akses ini hanya untuk Admin.");
    return callback(client, actor);
  });
}

function categoryError(error) {
  if (error.code === "23505" && error.constraint === "categories_name_unique") {
    return new AdminError("DUPLICATE_CATEGORY", "Nama kategori sudah digunakan.", { name: "Gunakan nama kategori yang berbeda." });
  }
  if (["23503", "23001"].includes(error.code) && error.constraint === "artworks_category_id_fkey") {
    return new AdminError("CATEGORY_IN_USE", "Kategori masih dipakai karya. Pindahkan kategori karya tersebut sebelum menghapusnya.");
  }
  return error;
}

export async function createCategory(token, values) {
  try {
    return await withAdminTransaction(token, async (client) => {
      const data = categoryInput(values);
      return (await query("categoryCreate", [data.name, data.description], client)).rows[0];
    });
  } catch (error) { throw categoryError(error); }
}

export async function updateCategory(token, value, values) {
  try {
    return await withAdminTransaction(token, async (client) => {
      const id = positiveId(value);
      const data = categoryInput(values);
      const result = await query("categoryUpdate", [id, data.name, data.description], client);
      if (!result.rowCount) throw new AdminError("NOT_FOUND", "Kategori tidak ditemukan. Muat ulang daftar.");
      return result.rows[0];
    });
  } catch (error) { throw categoryError(error); }
}

export async function deleteCategory(token, value, confirmation) {
  try {
    return await withAdminTransaction(token, async (client) => {
      const id = positiveId(value);
      if (confirmation !== "yes") throw new AdminError("CONFIRMATION", "Centang konfirmasi sebelum menghapus kategori.");
      const result = await query("categoryDelete", [id], client);
      if (!result.rowCount) throw new AdminError("NOT_FOUND", "Kategori sudah dihapus atau tidak ditemukan.");
      return result.rows[0];
    });
  } catch (error) { throw categoryError(error); }
}

export async function deleteUser(token, value, confirmationEmail) {
  return withAdminTransaction(token, async (client, actor) => {
    const id = positiveId(value);
    const target = (await query("adminUserLock", [id], client)).rows[0];
    if (!target) throw new AdminError("NOT_FOUND", "Pengguna sudah dihapus atau tidak ditemukan.");
    if (target.id === actor.id || !["member", "curator"].includes(target.role)) {
      throw new AdminError("PROTECTED_ADMIN", "Akun Admin tidak dapat dihapus, termasuk akunmu sendiri.");
    }
    if (typeof confirmationEmail !== "string" || normalizeEmail(confirmationEmail) !== target.email) {
      throw new AdminError("CONFIRMATION", "Email konfirmasi belum sama dengan email akun yang akan dihapus.");
    }
    const files = (await query("adminUserFiles", [id], client)).rows.map((row) => row.file_path);
    const removed = await query("adminUserDelete", [id, actor.id], client);
    if (removed.rowCount !== 1) throw new AdminError("CONFLICT", "Pengguna tidak dapat dihapus. Muat ulang daftar.");
    return { id, files };
  });
}

export async function verifyCurator(token, value, decision, reason) {
  return withAdminTransaction(token, async (client) => {
    const id = positiveId(value);
    if (!["approved", "rejected"].includes(decision)) throw new AdminError("VALIDATION", "Keputusan verifikasi tidak valid.");
    const rejectionReason = typeof reason === "string" ? reason.trim() : "";
    if (decision === "rejected" && (rejectionReason.length < 5 || rejectionReason.length > 500)) {
      throw new AdminError("VALIDATION", "Alasan penolakan harus 5–500 karakter.", { reason: "Jelaskan alasan penolakan dalam 5–500 karakter." });
    }
    const target = (await query("adminUserLock", [id], client)).rows[0];
    if (!target || target.role !== "curator") throw new AdminError("NOT_FOUND", "Akun Curator tidak ditemukan.");
    if (target.curator_status !== "pending") throw new AdminError("CONFLICT", "Pendaftaran ini sudah diproses. Muat ulang antrean.");
    return (await query("curatorVerify", [id, decision, decision === "rejected" ? rejectionReason : null], client)).rows[0];
  });
}
