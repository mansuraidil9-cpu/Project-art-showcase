import "server-only";
import { unlink } from "node:fs/promises";
import path from "node:path";

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
