SELECT id,email,display_name,role,curator_status FROM users WHERE id=$1 FOR UPDATE;
