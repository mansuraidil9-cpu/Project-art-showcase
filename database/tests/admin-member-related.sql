SELECT
 (SELECT count(*)::integer FROM users WHERE id=$1) AS users,
 (SELECT count(*)::integer FROM sessions WHERE user_id=$1) AS sessions,
 (SELECT count(*)::integer FROM artworks WHERE id=$2) AS artworks,
 (SELECT count(*)::integer FROM likes WHERE artwork_id=$2) AS likes,
 (SELECT count(*)::integer FROM favorites WHERE artwork_id=$2) AS favorites,
 (SELECT count(*)::integer FROM comments WHERE artwork_id=$2) AS comments,
 (SELECT count(*)::integer FROM reports WHERE artwork_id=$2) AS reports,
 (SELECT count(*)::integer FROM submissions WHERE artwork_id=$2) AS submissions,
 (SELECT count(*)::integer FROM winners WHERE submission_id=$3) AS winners;
