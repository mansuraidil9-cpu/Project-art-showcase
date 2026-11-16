SELECT id,artwork_id FROM comments WHERE id=$1 AND member_id=$2 FOR UPDATE;
