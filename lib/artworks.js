import "server-only";
import { query, withTransaction } from "./db.js";
import { getSessionUser } from "./session.js";
import { parseId } from "./validation.js";
import { MAX_TAGS, searchPattern } from "./artwork-rules.js";
import { removeUploads, saveArtworkImage } from "./uploads.js";

export class ArtworkError extends Error {
  constructor(code, message, fields = {}) {
    super(message);
    this.code = code;
    this.fields = fields;
  }
}

export function artworkInput(values) {
  const title = typeof values.title === "string" ? values.title.trim() : "";
  const description = typeof values.description === "string" ? values.description.trim() : "";
  const categoryId = parseId(values.categoryId);
  const rawTags = typeof values.tags === "string" ? values.tags : "";
  const tags = [...new Set(rawTags.split(",").map((tag) => tag.trim().replace(/\s+/g, " ").toLowerCase()).filter(Boolean))].sort();
  const fields = {};
  if (!title || title.length > 150) fields.title = "Judul wajib diisi, maksimal 150 karakter.";
  if (!description || description.length > 5000) fields.description = "Deskripsi wajib diisi, maksimal 5.000 karakter.";
  if (!categoryId) fields.categoryId = "Pilih kategori yang tersedia.";
  if (!tags.length || tags.length > MAX_TAGS || rawTags.length > 500 || tags.some((tag) => tag.length > 40)) {
    fields.tags = "Isi 1–10 tag, maksimal 40 karakter per tag, dipisahkan koma.";
  }
  if (Object.keys(fields).length) throw new ArtworkError("VALIDATION", "Periksa kembali isian karya.", fields);
  return { title, description, categoryId, tags };
}

async function withMemberTransaction(token, callback) {
  return withTransaction(async (client) => {
    const user = await getSessionUser(token, client, true);
    if (!user) throw new ArtworkError("UNAUTHORIZED", "Sesi sudah berakhir. Silakan masuk kembali.");
    if (user.role !== "member") throw new ArtworkError("FORBIDDEN", "Pengelolaan karya hanya tersedia untuk Member.");
    return callback(client, user);
  });
}

async function checkCategory(client, id) {
  if (!(await query("artworkCategoryLock", [id], client)).rowCount) {
    throw new ArtworkError("CATEGORY_UNAVAILABLE", "Kategori sudah tidak tersedia.", { categoryId: "Pilih kategori yang tersedia." });
  }
}

async function saveTags(client, artworkId, tags) {
  await query("artworkTagsClear", [artworkId], client);
  for (const name of tags) {
    const tag = (await query("artworkTagUpsert", [name], client)).rows[0];
    await query("artworkTagLink", [artworkId, tag.id], client);
  }
}

function artworkId(value) {
  const id = parseId(value);
  if (!id) throw new ArtworkError("INVALID_ID", "ID karya tidak valid.");
  return id;
}

async function ownedArtwork(client, id, userId) {
  const result = await query("artworkOwnedLock", [id, userId], client);
  if (!result.rowCount) throw new ArtworkError("NOT_FOUND", "Karya tidak ditemukan atau bukan milikmu.");
  return result.rows[0];
}

export async function createArtwork(token, values, file) {
  let uploaded = null;
  try {
    return await withMemberTransaction(token, async (client, user) => {
      const data = artworkInput(values);
      await checkCategory(client, data.categoryId);
      uploaded = await saveArtworkImage(file);
      const artwork = (await query("artworkCreate", [user.id, data.categoryId, data.title, data.description, uploaded], client)).rows[0];
      await saveTags(client, artwork.id, data.tags);
      return artwork;
    });
  } catch (error) {
    if (uploaded) await removeUploads([uploaded]);
    throw error;
  }
}

export async function updateArtwork(token, value, values, replacement = null) {
  return withMemberTransaction(token, async (client, user) => {
    const id = artworkId(value);
    await ownedArtwork(client, id, user.id);
    if (replacement && (typeof replacement !== "object" || replacement.size > 0)) {
      throw new ArtworkError("IMMUTABLE_FILE", "File karya tidak bisa diganti. Hapus karya lalu unggah ulang jika ingin mengganti file.", { file: "File karya tetap saat edit." });
    }
    const data = artworkInput(values);
    await checkCategory(client, data.categoryId);
    const result = await query("artworkUpdate", [id, user.id, data.title, data.description, data.categoryId], client);
    await saveTags(client, id, data.tags);
    return result.rows[0];
  });
}

export async function deleteArtwork(token, value, confirmation) {
  return withMemberTransaction(token, async (client, user) => {
    const id = artworkId(value);
    const artwork = await ownedArtwork(client, id, user.id);
    if (confirmation !== "yes") throw new ArtworkError("CONFIRMATION", "Centang konfirmasi penghapusan karya.");
    await query("artworkDelete", [id, user.id], client);
    return artwork;
  });
}

export async function getGallery({ q = "", categoryId = null, creatorId = null, sort = "latest", page = 1, pageSize = 12 } = {}) {
  const values = [searchPattern(q), categoryId, creatorId];
  const total = (await query("artworkGalleryCount", values)).rows[0].total;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pages);
  const artworks = (await query("artworkGallery", [...values, sort, pageSize, (currentPage - 1) * pageSize])).rows;
  return { artworks, total, page: currentPage, pages };
}
