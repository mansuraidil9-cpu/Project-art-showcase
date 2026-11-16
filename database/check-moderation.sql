-- Query baca saja. Buka melalui ikon folder Query Tool lalu F5.
SELECT
 (SELECT count(*) FROM users WHERE role='admin') AS admin,
 (SELECT count(*) FROM users WHERE role='member') AS member,
 (SELECT count(*) FROM users WHERE role='curator') AS curator,
 (SELECT count(*) FROM artworks) AS karya,
 (SELECT count(*) FROM reports WHERE status='pending') AS laporan_menunggu,
 (SELECT count(*) FROM challenges WHERE starts_at<=now() AND ends_at>now()) AS challenge_aktif;

SELECT a.id,a.title,count(*) AS jumlah_laporan,array_agg(DISTINCT r.reason) AS alasan
FROM reports r JOIN artworks a ON a.id=r.artwork_id WHERE r.status='pending'
GROUP BY a.id,a.title ORDER BY min(r.created_at),a.id;

SELECT r.id,a.title,r.reason,r.details,r.status,reviewer.display_name AS ditinjau_oleh,r.reviewed_at
FROM reports r JOIN artworks a ON a.id=r.artwork_id
LEFT JOIN users reviewer ON reviewer.id=r.reviewed_by ORDER BY r.created_at DESC;

SELECT u.display_name,a.title,f.created_at AS disimpan_pada
FROM favorites f JOIN users u ON u.id=f.member_id JOIN artworks a ON a.id=f.artwork_id
ORDER BY f.created_at DESC,a.id DESC;
