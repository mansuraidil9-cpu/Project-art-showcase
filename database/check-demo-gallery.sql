-- Pemeriksaan baca saja setelah pembaruan gambar contoh.
SELECT a.id,a.title,c.name AS category,a.media_type,a.file_path,
 array_agg(t.name ORDER BY t.name) FILTER (WHERE t.id IS NOT NULL) AS tags
FROM artworks a JOIN categories c ON c.id=a.category_id
LEFT JOIN artwork_tags at ON at.artwork_id=a.id LEFT JOIN tags t ON t.id=at.tag_id
WHERE a.file_path LIKE '/examples/hd/%'
GROUP BY a.id,c.name ORDER BY a.id;

SELECT id,title,banner_path FROM challenges
WHERE banner_path LIKE '/examples/hd/%' ORDER BY id;

SELECT tgname,tgenabled FROM pg_trigger
WHERE tgrelid='artworks'::regclass AND tgname='artworks_file_immutable';
