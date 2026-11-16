SELECT a.id,a.title,a.description,a.file_path,a.media_type,a.category_id,a.member_id,a.created_at,
u.display_name,c.name AS category,
(SELECT count(*)::integer FROM likes WHERE artwork_id=a.id) AS like_count,
ARRAY(SELECT t.name FROM artwork_tags at JOIN tags t ON t.id=at.tag_id WHERE at.artwork_id=a.id ORDER BY t.name) AS tags
FROM artworks a JOIN users u ON u.id=a.member_id JOIN categories c ON c.id=a.category_id WHERE a.id=$1;
