SELECT count(*)::integer AS total
FROM artworks a JOIN users u ON u.id=a.member_id
WHERE ($1::text='' OR a.title ILIKE $1::text OR u.display_name ILIKE $1::text)
AND ($2::integer IS NULL OR a.category_id=$2::integer)
AND ($3::integer IS NULL OR a.member_id=$3::integer);
