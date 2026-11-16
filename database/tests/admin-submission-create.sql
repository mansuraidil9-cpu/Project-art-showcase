INSERT INTO submissions(challenge_id,member_id,artwork_id) VALUES($1,$2,$3) RETURNING id;
