INSERT INTO challenges(curator_id,title,description,rules,prize,starts_at,ends_at,banner_path)
VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,banner_path;
