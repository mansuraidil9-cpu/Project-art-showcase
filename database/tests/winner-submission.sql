INSERT INTO submissions(challenge_id,member_id,artwork_id,created_at)
SELECT c.id,$2,$3,c.starts_at+(c.ends_at-c.starts_at)/2 FROM challenges c WHERE c.id=$1 RETURNING id;
