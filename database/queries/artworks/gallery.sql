SELECT a.id,a.title,a.file_path,a.media_type,a.created_at,a.member_id,
u.display_name,c.name AS category,COALESCE(l.like_count,0)::integer AS like_count
FROM artworks a JOIN users u ON u.id=a.member_id JOIN categories c ON c.id=a.category_id
LEFT JOIN (SELECT artwork_id,count(*) AS like_count FROM likes GROUP BY artwork_id) l ON l.artwork_id=a.id
WHERE ($1::text='' OR a.title ILIKE $1::text OR u.display_name ILIKE $1::text)
AND ($2::integer IS NULL OR a.category_id=$2::integer)
AND ($3::integer IS NULL OR a.member_id=$3::integer)
ORDER BY CASE WHEN $4::text='popular' THEN COALESCE(l.like_count,0) END DESC,
a.created_at DESC,a.id DESC
LIMIT $5 OFFSET $6;
