DELETE FROM users WHERE id=$1 AND role='curator' AND curator_status='rejected' RETURNING id;
