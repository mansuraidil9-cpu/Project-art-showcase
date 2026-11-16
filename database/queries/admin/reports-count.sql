SELECT count(*)::integer AS total FROM reports WHERE artwork_id=$1 AND status='pending';
