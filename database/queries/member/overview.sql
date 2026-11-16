SELECT
 (SELECT count(*)::integer FROM artworks WHERE member_id=$1) AS artworks,
 (SELECT count(*)::integer FROM favorites WHERE member_id=$1) AS favorites,
 (SELECT count(*)::integer FROM likes l JOIN artworks a ON a.id=l.artwork_id WHERE a.member_id=$1) AS likes;
