import { parseId } from "./validation.js";

export const challengeStatuses = { active: "Sedang berlangsung", upcoming: "Segera dimulai", ended: "Selesai" };

export function formatWitaInput(value) {
  return new Date(new Date(value).getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

export function parseWitaDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(value + ":00+08:00");
  return Number.isFinite(date.getTime()) && formatWitaInput(date) === value ? date : null;
}

export function challengeFilters(params = {}) {
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const valid = status === "all" || Object.hasOwn(challengeStatuses, status);
  return { q, status: valid ? status : "all", page: parseId(params.page) || 1,
    error: q.length > 100 ? "Pencarian maksimal 100 karakter." : !valid ? "Status challenge tidak valid." : "" };
}
