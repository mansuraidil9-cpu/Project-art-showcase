import { open } from "node:fs/promises";
import path from "node:path";
import { MAX_IMAGE_BYTES } from "@/lib/artwork-rules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const filenamePattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\.webp$/i;
const notFound = () => new Response("Gambar tidak ditemukan.", { status: 404, headers: { "Cache-Control": "no-store" } });

export async function GET(request, { params }) {
  const { filename } = await params;
  if (!filenamePattern.test(filename)) return notFound();
  let file;
  try {
    file = await open(path.join(process.cwd(), "public", "uploads", filename), "r");
    const info = await file.stat();
    if (!info.isFile() || info.size <= 0 || info.size > MAX_IMAGE_BYTES) return notFound();
    const body = await file.readFile();
    return new Response(body, { headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(body.length),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=3600",
    } });
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return notFound();
    console.error("Gambar belum dapat dimuat:", error.code);
    return new Response("Gambar belum dapat dimuat.", { status: 503, headers: { "Cache-Control": "no-store" } });
  } finally {
    if (file) await file.close();
  }
}
