SELECT s.id,s.artwork_id,a.title,u.display_name
FROM submissions s JOIN artworks a ON a.id=s.artwork_id JOIN users u ON u.id=s.member_id
WHERE s.challenge_id=$1 ORDER BY s.created_at,s.id;
