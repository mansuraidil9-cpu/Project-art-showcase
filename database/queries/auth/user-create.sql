INSERT INTO users(email, password_hash, display_name, role, curator_status)
VALUES($1,$2,$3,$4::varchar,CASE WHEN $4::varchar='curator' THEN 'pending' ELSE NULL END)
RETURNING id,display_name,role,curator_status;
