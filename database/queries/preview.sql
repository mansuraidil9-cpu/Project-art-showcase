SELECT a.id, a.title, a.file_path, u.display_name, c.name AS category
FROM artworks a
JOIN users u ON u.id = a.member_id
JOIN categories c ON c.id = a.category_id
ORDER BY a.created_at DESC, a.id DESC
LIMIT $1;

