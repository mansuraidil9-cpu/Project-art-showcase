SELECT c.id,c.title,c.banner_path,c.starts_at,c.ends_at,u.display_name AS curator_name,
 CASE WHEN c.starts_at>now() THEN 'upcoming' WHEN c.ends_at<=now() THEN 'ended' ELSE 'active' END AS status,
 (SELECT count(*)::integer FROM submissions s WHERE s.challenge_id=c.id) AS submission_count
FROM challenges c JOIN users u ON u.id=c.curator_id
WHERE u.role='curator' AND u.curator_status='approved'
AND ($1::text='' OR c.title ILIKE $1 OR u.display_name ILIKE $1)
AND ($2::text='all' OR ($2='active' AND c.starts_at<=now() AND c.ends_at>now())
 OR ($2='upcoming' AND c.starts_at>now()) OR ($2='ended' AND c.ends_at<=now()))
ORDER BY CASE WHEN c.ends_at<=now() THEN 2 WHEN c.starts_at>now() THEN 1 ELSE 0 END,
 CASE WHEN c.ends_at>now() THEN CASE WHEN c.starts_at>now() THEN c.starts_at ELSE c.ends_at END END,
 c.ends_at DESC,c.id DESC LIMIT $3 OFFSET $4;
