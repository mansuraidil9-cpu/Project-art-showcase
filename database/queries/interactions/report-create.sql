INSERT INTO reports(member_id,artwork_id,reason,details) VALUES($1,$2,$3,$4)
ON CONFLICT(member_id,artwork_id) DO NOTHING RETURNING id;
