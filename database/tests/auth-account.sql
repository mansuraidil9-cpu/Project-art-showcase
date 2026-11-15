SELECT id,email,password_hash,role,curator_status FROM users WHERE email=$1;
