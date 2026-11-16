SELECT c.id,c.curator_id,c.title,c.description,c.rules,c.prize,c.starts_at,c.ends_at,c.banner_path,c.created_at,
 u.display_name AS curator_name,
 CASE WHEN c.starts_at>now() THEN 'upcoming' WHEN c.ends_at<=now() THEN 'ended' ELSE 'active' END AS status
FROM challenges c JOIN users u ON u.id=c.curator_id
WHERE c.id=$1 AND u.role='curator' AND u.curator_status='approved';
