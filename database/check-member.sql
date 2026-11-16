-- Query baca saja. Buka file melalui ikon folder Query Tool, lalu tekan F5.
SELECT u.id,u.display_name,u.bio,u.avatar_path,u.website_url,u.instagram_url,u.behance_url
FROM users u WHERE u.role='member' ORDER BY u.id;

SELECT a.id,a.title,
 (SELECT count(*) FROM likes l WHERE l.artwork_id=a.id) AS jumlah_suka,
 (SELECT count(*) FROM favorites f WHERE f.artwork_id=a.id) AS jumlah_favorit,
 (SELECT count(*) FROM comments c WHERE c.artwork_id=a.id) AS jumlah_komentar,
 (SELECT count(*) FROM reports r WHERE r.artwork_id=a.id) AS jumlah_laporan
FROM artworks a ORDER BY a.id;

SELECT r.id,u.display_name AS pelapor,a.title,r.reason,r.details,r.status
FROM reports r JOIN users u ON u.id=r.member_id JOIN artworks a ON a.id=r.artwork_id
ORDER BY r.created_at DESC;

-- Hasil true menunjukkan semua akun menyimpan hash bcrypt, tanpa menampilkan hashnya.
SELECT bool_and(password_hash ~ '^\$2[aby]\$') AS semua_password_bcrypt FROM users;
