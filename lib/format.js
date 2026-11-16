export function formatDate(value) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "Asia/Makassar",
  }).format(new Date(value));
}

export const roleNames = { admin: "Admin", member: "Member", curator: "Curator" };
export function formatDateTime(value) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Makassar" }).format(new Date(value));
}
export const statusNames = { pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak" };

