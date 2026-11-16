import "server-only";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "./artwork-rules.js";

export class UploadError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.fields = { file: message };
  }
}

export async function saveArtworkImage(file) {
  if (!file || typeof file.arrayBuffer !== "function" || !Number.isInteger(file.size) || file.size <= 0) {
    throw new UploadError("INVALID_FILE", "Pilih gambar karya yang akan diunggah.");
  }
  if (file.size > MAX_IMAGE_BYTES) throw new UploadError("FILE_TOO_LARGE", "Ukuran gambar maksimal 5 MB.");
  if (!IMAGE_TYPES.includes(file.type)) throw new UploadError("INVALID_FILE_TYPE", "Gunakan gambar JPEG, PNG, atau WebP.");
  const extensions = { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] };
  if (typeof file.name !== "string" || !extensions[file.type].includes(path.extname(file.name).toLowerCase())) {
    throw new UploadError("INVALID_FILE_TYPE", "Ekstensi file harus sesuai dengan tipe gambar JPEG, PNG, atau WebP.");
  }
  const input = Buffer.from(await file.arrayBuffer());
  if (input.length !== file.size || input.length > MAX_IMAGE_BYTES) throw new UploadError("INVALID_FILE", "Isi atau ukuran file tidak valid.");
  const signatureMatches = file.type === "image/png"
    ? input.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    : file.type === "image/jpeg"
      ? input[0] === 255 && input[1] === 216 && input[2] === 255
      : input.subarray(0, 4).toString("ascii") === "RIFF" && input.subarray(8, 12).toString("ascii") === "WEBP";
  if (!signatureMatches) throw new UploadError("INVALID_IMAGE", "Isi file tidak sesuai dengan tipe gambar yang dipilih.");
  let output;
  try {
    const image = sharp(input, { limitInputPixels: 20_000_000, failOn: "warning" });
    const metadata = await image.metadata();
    const formats = { "image/jpeg": "jpeg", "image/png": "png", "image/webp": "webp" };
    if (metadata.format !== formats[file.type] || !metadata.width || !metadata.height || (metadata.pages || 1) > 1) {
      throw new Error("Format gambar tidak sesuai");
    }
    output = await image.rotate().webp({ quality: 90 }).toBuffer();
  } catch {
    throw new UploadError("INVALID_IMAGE", "Gambar tidak dapat dibaca. Gunakan gambar statis yang valid, maksimal 20 megapiksel.");
  }
  if (output.length > MAX_IMAGE_BYTES) throw new UploadError("FILE_TOO_LARGE", "Hasil gambar melebihi 5 MB. Perkecil gambar sebelum mengunggah.");
  const filePath = "/uploads/" + randomUUID() + ".webp";
  try {
    await mkdir(path.join(process.cwd(), "public", "uploads"), { recursive: true });
    await writeFile(path.join(process.cwd(), "public", filePath.slice(1)), output, { flag: "wx" });
  } catch (error) {
    if (error.code !== "EEXIST") await removeUploads([filePath]);
    console.error("Penyimpanan gambar gagal:", error.code);
    throw new UploadError("UPLOAD_STORAGE", "Gambar belum dapat disimpan. Coba kembali.");
  }
  return filePath;
}

export async function removeUploads(paths) {
  let failed = 0;
  for (const file of new Set(paths)) {
    // Berkas contoh dan lokasi di luar folder unggahan tetap dipertahankan.
    if (typeof file !== "string" || !/^\/uploads\/[a-f0-9-]+\.(png|jpe?g|webp|gif)$/i.test(file)) continue;
    try {
      await unlink(path.join(process.cwd(), "public", file.slice(1)));
    } catch (error) {
      if (error.code !== "ENOENT") {
        failed += 1;
        console.error("Berkas unggahan belum terhapus:", error.code);
      }
    }
  }
  return failed;
}
