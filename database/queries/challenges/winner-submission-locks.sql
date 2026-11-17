SELECT id FROM submissions WHERE challenge_id=$1 AND id=ANY($2::integer[]) ORDER BY id FOR KEY SHARE;
