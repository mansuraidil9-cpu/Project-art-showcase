import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "Cache-Control": "no-store", Vary: "Cookie" };
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401, headers });
    return Response.json({
      user: { id: user.id, displayName: user.display_name, role: user.role, curatorStatus: user.curator_status },
    }, { headers });
  } catch (error) {
    console.error("Pemeriksaan sesi gagal:", error.code || "AUTH_CONFIG");
    return Response.json({ message: "Sesi belum dapat diperiksa." }, { status: 503, headers });
  }
}

