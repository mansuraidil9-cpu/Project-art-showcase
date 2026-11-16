-- Buka file ini di Query Tool untuk membaca data karya dan tags.
SELECT a.id,a.title,u.display_name AS creator,c.name AS category,a.file_path,a.media_type,
 ARRAY(SELECT t.name FROM artwork_tags at JOIN tags t ON t.id=at.tag_id WHERE at.artwork_id=a.id ORDER BY t.name) AS tags,
 (SELECT count(*) FROM likes l WHERE l.artwork_id=a.id) AS likes
FROM artworks a JOIN users u ON u.id=a.member_id JOIN categories c ON c.id=a.category_id
ORDER BY a.created_at DESC,a.id DESC;
