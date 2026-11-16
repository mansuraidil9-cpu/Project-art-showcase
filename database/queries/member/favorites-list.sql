SELECT a.id,a.title,a.file_path,a.media_type,a.created_at,a.member_id,
 u.display_name,c.name AS category,
 (SELECT count(*)::integer FROM likes l WHERE l.artwork_id=a.id) AS like_count
FROM favorites f JOIN artworks a ON a.id=f.artwork_id
JOIN users u ON u.id=a.member_id JOIN categories c ON c.id=a.category_id
WHERE f.member_id=$1 ORDER BY f.created_at DESC,a.id DESC LIMIT $2 OFFSET $3;
