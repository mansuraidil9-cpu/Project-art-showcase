import "server-only";
import { query } from "./db.js";
import { withMemberTransaction } from "./member.js";
import { pagination } from "./pagination.js";

export function getMemberOverview(token) {
  return withMemberTransaction(token, async (client, user) => {
    const statistics = (await query("memberOverview", [user.id], client)).rows[0];
    const artworks = (await query("artworkGallery", ["", null, user.id, "latest", 3, 0], client)).rows;
    return { statistics, artworks };
  });
}

export function getFavorites(token, requestedPage = 1) {
  return withMemberTransaction(token, async (client, user) => {
    const total = (await query("favoritesCount", [user.id], client)).rows[0].total;
    const page = pagination(total, requestedPage, 12);
    const artworks = (await query("favoritesList", [user.id, 12, page.offset], client)).rows;
    return { ...page, artworks };
  });
}
