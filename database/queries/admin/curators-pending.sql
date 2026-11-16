SELECT id,email,display_name,bio,created_at FROM users
WHERE role='curator' AND curator_status='pending' ORDER BY created_at,id;
