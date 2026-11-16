import { parseId } from "./validation.js";

export function pagination(total, requested, pageSize) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(parseId(requested) || 1, pages);
  return { total, page, pages, offset: (page - 1) * pageSize };
}
