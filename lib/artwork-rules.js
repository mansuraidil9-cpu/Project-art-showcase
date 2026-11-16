import { parseId } from "./validation.js";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_TAGS = 10;

export function galleryFilters(params = {}) {
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const category = typeof params.category === "string" ? params.category : "";
  const sort = typeof params.sort === "string" ? params.sort : "latest";
  const pageValue = Number(params.page);
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  let error = "";
  if (q.length > 100) error = "Pencarian maksimal 100 karakter.";
  if (category && !parseId(category)) error = "Filter kategori tidak valid.";
  if (!["latest", "popular"].includes(sort)) error = "Pilihan urutan tidak valid.";
  return { q, categoryId: parseId(category), sort: ["latest", "popular"].includes(sort) ? sort : "latest", page, error };
}

export function searchPattern(text) {
  return text ? "%" + text.replace(/[\\%_]/g, "\\$&") + "%" : "";
}
