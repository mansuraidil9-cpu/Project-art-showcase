SELECT a.id,a.title,a.file_path,a.media_type,a.member_id,a.created_at,u.display_name,cat.name AS category,
 w.rank,w.created_at AS awarded_at,c.id AS challenge_id,c.title AS challenge_title,
 (SELECT count(*)::integer FROM likes l WHERE l.artwork_id=a.id) AS like_count
FROM winners w JOIN submissions s ON s.id=w.submission_id
JOIN artworks a ON a.id=s.artwork_id JOIN users u ON u.id=s.member_id
JOIN categories cat ON cat.id=a.category_id JOIN challenges c ON c.id=w.challenge_id
JOIN users cu ON cu.id=c.curator_id
WHERE c.id=$1 AND c.ends_at<clock_timestamp() AND cu.role='curator' AND cu.curator_status='approved'
ORDER BY w.rank;
