WITH awarded AS (
 SELECT a.id,a.title,a.file_path,a.media_type,a.member_id,a.created_at,u.display_name,cat.name AS category,
 w.rank,c.id AS challenge_id,c.title AS challenge_title,
 max(w.created_at) OVER(PARTITION BY w.challenge_id) AS announced_at,
 row_number() OVER(PARTITION BY a.id ORDER BY w.created_at DESC,c.id DESC,w.rank) AS artwork_order,
 (SELECT count(*)::integer FROM likes l WHERE l.artwork_id=a.id) AS like_count
 FROM winners w JOIN submissions s ON s.id=w.submission_id
 JOIN artworks a ON a.id=s.artwork_id JOIN users u ON u.id=s.member_id
 JOIN categories cat ON cat.id=a.category_id JOIN challenges c ON c.id=w.challenge_id
 JOIN users cu ON cu.id=c.curator_id
 WHERE c.ends_at<clock_timestamp() AND cu.role='curator' AND cu.curator_status='approved'
)
SELECT id,title,file_path,media_type,member_id,created_at,display_name,category,rank,challenge_id,challenge_title,like_count
FROM awarded WHERE artwork_order=1 ORDER BY announced_at DESC,challenge_id DESC,rank,id DESC LIMIT $1;
