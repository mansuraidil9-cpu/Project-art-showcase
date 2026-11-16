SELECT
 (SELECT count(*)::integer FROM challenges WHERE id=$1) AS challenges,
 (SELECT count(*)::integer FROM submissions WHERE challenge_id=$1) AS submissions,
 (SELECT count(*)::integer FROM winners WHERE challenge_id=$1) AS winners,
 (SELECT count(*)::integer FROM artworks WHERE id=$2) AS original_artwork;
