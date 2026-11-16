SELECT c.id,c.title,c.banner_path,c.starts_at,c.ends_at,u.display_name AS curator_name,
 CASE WHEN c.starts_at>now() THEN 'upcoming' WHEN c.ends_at<=now() THEN 'ended' ELSE 'active' END AS status,
 (SELECT count(*)::integer FROM submissions s WHERE s.challenge_id=c.id) AS submission_count
FROM challenges c JOIN users u ON u.id=c.curator_id WHERE c.curator_id=$1
ORDER BY c.created_at DESC,c.id DESC LIMIT $2 OFFSET $3;
