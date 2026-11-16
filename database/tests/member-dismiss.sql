UPDATE reports SET status='dismissed',reviewed_at=now(),reviewed_by=$3 WHERE member_id=$1 AND artwork_id=$2;
