SELECT id, email, password_hash, display_name, role, curator_status
FROM users WHERE email=$1;
