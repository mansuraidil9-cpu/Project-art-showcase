DELETE FROM submissions s USING challenges c
WHERE s.challenge_id=c.id AND c.id=$1 AND s.member_id=$2 AND c.ends_at>clock_timestamp() RETURNING s.id;
