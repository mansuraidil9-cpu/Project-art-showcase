DELETE FROM comments WHERE id=$1 AND member_id=$2 RETURNING id,artwork_id;
