import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../.env.local", import.meta.url);
let source;
try {
  source = await readFile(file, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  source = await readFile(new URL("../.env.example", import.meta.url), "utf8");
}
const current = source.match(/^SESSION_SECRET=(.*)$/m)?.[1].trim();
if (current && new TextEncoder().encode(current).length >= 32) {
  console.log("SESSION_SECRET sudah tersedia; nilainya dipertahankan.");
} else {
  const line = "SESSION_SECRET=" + randomBytes(32).toString("hex");
  source = /^SESSION_SECRET=.*$/m.test(source) ? source.replace(/^SESSION_SECRET=.*$/m, line) : source.trimEnd() + "\n" + line + "\n";
  await writeFile(file, source);
  console.log("SESSION_SECRET acak sudah disimpan di .env.local. Mulai ulang server jika sedang berjalan.");
}
