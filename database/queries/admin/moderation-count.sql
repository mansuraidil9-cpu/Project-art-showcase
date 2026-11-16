SELECT count(DISTINCT artwork_id)::integer AS total,count(*)::integer AS reports
FROM reports WHERE status='pending';
