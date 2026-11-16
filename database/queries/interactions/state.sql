SELECT
 EXISTS(SELECT 1 FROM likes WHERE artwork_id=$1 AND member_id=$2) AS liked,
 EXISTS(SELECT 1 FROM favorites WHERE artwork_id=$1 AND member_id=$2) AS favorited,
 (SELECT status FROM reports WHERE artwork_id=$1 AND member_id=$2) AS report_status;
