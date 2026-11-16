export function textField(form, name) {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

export function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

export function validEmail(value) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validPasswordLength(value) {
  return value.length >= 10 && value.trim().length > 0 && new TextEncoder().encode(value).length <= 72;
}

export function parseId(value) {
  const text = String(value ?? "");
  const id = Number(text);
  return /^[1-9]\d*$/.test(text) && Number.isSafeInteger(id) && id <= 2147483647 ? id : null;
}

