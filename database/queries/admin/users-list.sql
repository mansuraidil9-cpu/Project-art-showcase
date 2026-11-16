SELECT id,email,display_name,role,curator_status,created_at
FROM users WHERE ($1::text='' OR role=$1::text)
ORDER BY created_at DESC,id DESC LIMIT $2 OFFSET $3;
