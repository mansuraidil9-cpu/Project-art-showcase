SELECT c.id,c.name,c.description,count(a.id)::integer AS artwork_count
FROM categories c LEFT JOIN artworks a ON a.category_id=c.id
GROUP BY c.id ORDER BY lower(c.name),c.id;
