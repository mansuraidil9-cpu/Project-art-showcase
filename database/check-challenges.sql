-- Query baca saja. Buka melalui ikon folder Query Tool lalu F5.
SELECT c.id,c.title,u.display_name AS curator,c.starts_at AT TIME ZONE 'Asia/Makassar' AS mulai_wita,
 c.ends_at AT TIME ZONE 'Asia/Makassar' AS selesai_wita,
 CASE WHEN c.starts_at>now() THEN 'Segera dimulai' WHEN c.ends_at<=now() THEN 'Selesai' ELSE 'Sedang berlangsung' END AS status,
 (SELECT count(*) FROM submissions s WHERE s.challenge_id=c.id) AS jumlah_submisi,c.banner_path
FROM challenges c JOIN users u ON u.id=c.curator_id ORDER BY c.id;

SELECT s.id,c.title AS challenge,u.display_name AS member,a.title AS karya,
 s.created_at AT TIME ZONE 'Asia/Makassar' AS dikirim_wita
FROM submissions s JOIN challenges c ON c.id=s.challenge_id
JOIN users u ON u.id=s.member_id JOIN artworks a ON a.id=s.artwork_id ORDER BY s.id;

SELECT challenge_id,member_id,count(*) AS jumlah FROM submissions
GROUP BY challenge_id,member_id HAVING count(*)>1;

SELECT s.id FROM submissions s JOIN artworks a ON a.id=s.artwork_id WHERE s.member_id<>a.member_id;
