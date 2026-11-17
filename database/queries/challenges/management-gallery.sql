SELECT a.id,a.title,a.file_path,a.media_type,a.member_id,a.created_at,u.display_name,cat.name AS category,
 s.id AS submission_id,s.created_at AS submitted_at,w.rank,
 (SELECT count(*)::integer FROM likes l WHERE l.artwork_id=a.id) AS like_count
FROM submissions s JOIN artworks a ON a.id=s.artwork_id JOIN users u ON u.id=s.member_id
JOIN categories cat ON cat.id=a.category_id JOIN challenges c ON c.id=s.challenge_id
LEFT JOIN winners w ON w.submission_id=s.id AND c.ends_at<clock_timestamp()
WHERE s.challenge_id=$1 ORDER BY s.created_at DESC,s.id DESC LIMIT $2 OFFSET $3;
