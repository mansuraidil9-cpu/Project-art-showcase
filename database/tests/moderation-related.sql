SELECT
 (SELECT count(*)::integer FROM artworks WHERE id=$1) AS artworks,
 (SELECT count(*)::integer FROM artwork_tags WHERE artwork_id=$1) AS artwork_tags,
 (SELECT count(*)::integer FROM likes WHERE artwork_id=$1) AS likes,
 (SELECT count(*)::integer FROM favorites WHERE artwork_id=$1) AS favorites,
 (SELECT count(*)::integer FROM comments WHERE artwork_id=$1) AS comments,
 (SELECT count(*)::integer FROM reports WHERE artwork_id=$1) AS reports,
 (SELECT count(*)::integer FROM submissions WHERE artwork_id=$1) AS submissions,
 (SELECT count(*)::integer FROM winners WHERE submission_id=$2) AS winners;
