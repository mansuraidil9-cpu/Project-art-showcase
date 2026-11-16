SELECT (SELECT count(*)::int FROM likes WHERE member_id=$1 AND artwork_id=$2) AS likes,
 (SELECT count(*)::int FROM favorites WHERE member_id=$1 AND artwork_id=$2) AS favorites,
 (SELECT count(*)::int FROM reports WHERE member_id=$1 AND artwork_id=$2) AS reports;
