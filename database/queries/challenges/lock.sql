SELECT c.id,c.starts_at,c.ends_at FROM challenges c JOIN users u ON u.id=c.curator_id
WHERE c.id=$1 AND u.role='curator' AND u.curator_status='approved' FOR UPDATE OF c;
