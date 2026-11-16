SELECT r.id,r.artwork_id,r.reason,r.details,r.created_at,u.display_name AS reporter_name
FROM reports r JOIN users u ON u.id=r.member_id
WHERE r.artwork_id=$1 AND r.status='pending'
ORDER BY r.created_at,r.id LIMIT $2 OFFSET $3;
