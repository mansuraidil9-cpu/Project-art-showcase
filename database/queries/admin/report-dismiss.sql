UPDATE reports SET status='dismissed',reviewed_by=$3,reviewed_at=now()
WHERE id=$1 AND artwork_id=$2 AND status='pending' RETURNING id,artwork_id;
