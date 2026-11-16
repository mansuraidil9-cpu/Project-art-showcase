import "server-only";
import { withTransaction } from "./db.js";
import { getSessionUser } from "./session.js";

export class MemberError extends Error {
  constructor(code, message, fields = {}) {
    super(message);
    this.code = code;
    this.fields = fields;
  }
}

export async function getMember(token, client = null, lock = false) {
  const user = await getSessionUser(token, client, lock);
  if (!user) throw new MemberError("UNAUTHORIZED", "Sesi sudah berakhir. Silakan masuk kembali.");
  if (user.role !== "member") throw new MemberError("FORBIDDEN", "Fitur ini hanya tersedia untuk Member.");
  return user;
}

export async function withMemberTransaction(token, callback) {
  return withTransaction(async (client) => callback(client, await getMember(token, client, true)));
}
