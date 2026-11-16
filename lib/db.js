import "server-only";
import pg from "pg";
import { readFile } from "node:fs/promises";
import path from "node:path";

const globalDb = globalThis;

function getPool() {
  if (!process.env.PGPASSWORD) {
    throw new Error("Isi PGPASSWORD di .env.local untuk menghubungkan database.");
  }
  if (!globalDb.artShowcasePool) {
    globalDb.artShowcasePool = new pg.Pool({
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || "art_showcase",
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD,
      max: 10,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    });
    globalDb.artShowcasePool.on("error", (error) => {
      console.error("Koneksi database terputus:", error.code);
    });
  }
  return globalDb.artShowcasePool;
}

const queryFiles = {
  platform: "platform.sql",
  preview: "preview.sql",
  connection: "connection.sql",
  userCreate: "auth/user-create.sql",
  userEmail: "auth/user-email.sql",
  sessionCreate: "auth/session-create.sql",
  sessionFind: "auth/session-find.sql",
  sessionFindLocked: "auth/session-find-locked.sql",
  sessionDelete: "auth/session-delete.sql",
  sessionCleanup: "auth/session-cleanup.sql",
  accountPassword: "auth/account-password.sql",
  accountDelete: "auth/account-delete.sql",
  limitAttempt: "auth/limit-attempt.sql",
  limitDelete: "auth/limit-delete.sql",
  categoriesList: "admin/categories-list.sql",
  categoryFind: "admin/category-find.sql",
  categoryCreate: "admin/category-create.sql",
  categoryUpdate: "admin/category-update.sql",
  categoryDelete: "admin/category-delete.sql",
  adminUsersCount: "admin/users-count.sql",
  adminUsersList: "admin/users-list.sql",
  adminUserLock: "admin/user-lock.sql",
  adminUserFiles: "admin/user-files.sql",
  adminUserDelete: "admin/user-delete.sql",
  curatorsPending: "admin/curators-pending.sql",
  curatorVerify: "admin/curator-verify.sql",
  artworkCategories: "artworks/categories.sql",
  artworkCategoryLock: "artworks/category-lock.sql",
  artworkCreate: "artworks/create.sql",
  artworkOwnedLock: "artworks/owned-lock.sql",
  artworkUpdate: "artworks/update.sql",
  artworkDelete: "artworks/delete.sql",
  artworkTagUpsert: "artworks/tag-upsert.sql",
  artworkTagsClear: "artworks/tags-clear.sql",
  artworkTagLink: "artworks/tag-link.sql",
  artworkGalleryCount: "artworks/gallery-count.sql",
  artworkGallery: "artworks/gallery.sql",
  artworkDetail: "artworks/detail.sql",
  artworkComments: "artworks/comments.sql",
  creatorPublic: "artworks/creator.sql",
  interactionArtworkLock: "interactions/artwork-lock.sql",
  interactionState: "interactions/state.sql",
  likeAdd: "interactions/like-add.sql",
  likeRemove: "interactions/like-remove.sql",
  favoriteAdd: "interactions/favorite-add.sql",
  favoriteRemove: "interactions/favorite-remove.sql",
  commentCreate: "interactions/comment-create.sql",
  commentOwnedLock: "interactions/comment-lock.sql",
  commentDelete: "interactions/comment-delete.sql",
  reportCreate: "interactions/report-create.sql",
  profileOwn: "profile/own.sql",
  profileUpdate: "profile/update.sql",
  profilePrivateLock: "profile/private-lock.sql",
  profileEmailUpdate: "profile/email-update.sql",
  profilePasswordUpdate: "profile/password-update.sql",
  userEmailLock: "auth/user-email-lock.sql",
  sessionsDeleteUser: "auth/sessions-delete-user.sql",
  moderationCount: "admin/moderation-count.sql",
  moderationList: "admin/moderation-list.sql",
  reportsCount: "admin/reports-count.sql",
  reportsList: "admin/reports-list.sql",
  reportFind: "admin/report-find.sql",
  reportDismiss: "admin/report-dismiss.sql",
  moderationArtworkLock: "admin/moderation-artwork-lock.sql",
  moderationArtworkDelete: "admin/moderation-artwork-delete.sql",
  memberOverview: "member/overview.sql",
  favoritesCount: "member/favorites-count.sql",
  favoritesList: "member/favorites-list.sql",
  challengeCreate: "challenges/create.sql",
  challengeOwnedLock: "challenges/owned-lock.sql",
  challengeUpdate: "challenges/update.sql",
  challengeDelete: "challenges/delete.sql",
  challengeOwnedCount: "challenges/owned-count.sql",
  challengeOwnedList: "challenges/owned-list.sql",
  challengeCount: "challenges/count.sql",
  challengeList: "challenges/list.sql",
  challengeDetail: "challenges/detail.sql",
  challengeLock: "challenges/lock.sql",
  challengeWindow: "challenges/window.sql",
  challengeSubmissionsCount: "challenges/submissions-count.sql",
  challengeSubmissionsGallery: "challenges/submissions-gallery.sql",
  challengeOwnSubmission: "challenges/own-submission.sql",
  challengeArtworkOptions: "challenges/artwork-options.sql",
  challengeSubmit: "challenges/submit.sql",
  challengeWithdraw: "challenges/withdraw.sql",
};
const sqlCache = new Map();

export async function readQuery(name) {
  const file = queryFiles[name];
  if (!file) throw new Error("Nama query tidak terdaftar.");
  if (!sqlCache.has(name)) {
    sqlCache.set(name, await readFile(path.join(process.cwd(), "database", "queries", file), "utf8"));
  }
  return sqlCache.get(name);
}

export async function query(name, values = [], client = null) {
  const sql = await readQuery(name);
  return (client || getPool()).query(sql, values);
}

export async function withTransaction(callback) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

