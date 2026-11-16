SELECT
 (SELECT count(*)::integer FROM users WHERE id=$1) AS users,
 (SELECT count(*)::integer FROM challenges WHERE id=$2) AS challenges,
 (SELECT count(*)::integer FROM submissions WHERE id=$3) AS submissions,
 (SELECT count(*)::integer FROM winners WHERE submission_id=$3) AS winners,
 (SELECT count(*)::integer FROM artworks WHERE id=$4) AS other_artwork;
