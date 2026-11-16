-- Pemeriksaan manual di Query Tool. Tidak menampilkan hash password atau token.
SELECT c.id,c.name,c.description,count(a.id) AS artworks
FROM categories c LEFT JOIN artworks a ON a.category_id=c.id
GROUP BY c.id ORDER BY c.id;

SELECT id,display_name,email,role,curator_status,rejection_reason
FROM users ORDER BY id;

SELECT id,display_name,email,created_at
FROM users WHERE role='curator' AND curator_status='pending' ORDER BY created_at;
