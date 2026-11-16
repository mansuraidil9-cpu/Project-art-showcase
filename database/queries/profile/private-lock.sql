SELECT id,email,password_hash FROM users WHERE id=$1 AND role='member' FOR UPDATE;
