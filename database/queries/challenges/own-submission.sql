SELECT s.id,s.artwork_id,a.title FROM submissions s JOIN artworks a ON a.id=s.artwork_id
WHERE s.challenge_id=$1 AND s.member_id=$2;
