SELECT a.id,a.title,a.file_path,a.media_type,a.member_id,a.created_at,u.display_name,c.name AS category,
 (SELECT count(*)::integer FROM likes l WHERE l.artwork_id=a.id) AS like_count
FROM submissions s JOIN artworks a ON a.id=s.artwork_id
JOIN users u ON u.id=s.member_id JOIN categories c ON c.id=a.category_id
WHERE s.challenge_id=$1 ORDER BY s.created_at DESC,s.id DESC LIMIT $2 OFFSET $3;
