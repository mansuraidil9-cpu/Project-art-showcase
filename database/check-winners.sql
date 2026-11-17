-- Query baca saja. Buka melalui ikon folder Query Tool lalu F5.
SELECT c.id,c.title,w.rank,a.title AS karya,u.display_name AS kreator,
 w.created_at AT TIME ZONE 'Asia/Makassar' AS diumumkan_wita
FROM winners w JOIN challenges c ON c.id=w.challenge_id JOIN submissions s ON s.id=w.submission_id
JOIN artworks a ON a.id=s.artwork_id JOIN users u ON u.id=s.member_id ORDER BY c.id,w.rank;

SELECT challenge_id,rank,count(*) FROM winners GROUP BY challenge_id,rank HAVING count(*)>1;

SELECT submission_id,count(*) FROM winners GROUP BY submission_id HAVING count(*)>1;

SELECT w.id FROM winners w JOIN submissions s ON s.id=w.submission_id WHERE w.challenge_id<>s.challenge_id;

SELECT u.display_name AS member,c.title AS challenge,a.title AS karya,w.rank
FROM submissions s JOIN users u ON u.id=s.member_id JOIN challenges c ON c.id=s.challenge_id
JOIN artworks a ON a.id=s.artwork_id LEFT JOIN winners w ON w.submission_id=s.id
ORDER BY u.id,s.created_at DESC;
