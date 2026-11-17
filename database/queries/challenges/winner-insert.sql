INSERT INTO winners(challenge_id,submission_id,rank,created_at)
SELECT c.id,$2,$3,clock_timestamp() FROM challenges c WHERE c.id=$1 AND c.ends_at<clock_timestamp()
RETURNING id;
