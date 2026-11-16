INSERT INTO submissions(challenge_id,member_id,artwork_id,created_at)
SELECT c.id,$2,$3,clock_timestamp() FROM challenges c WHERE c.id=$1 AND c.starts_at<=clock_timestamp() AND c.ends_at>clock_timestamp()
ON CONFLICT(challenge_id,member_id) DO NOTHING RETURNING id;
