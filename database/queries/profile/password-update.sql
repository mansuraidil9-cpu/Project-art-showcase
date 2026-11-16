UPDATE users SET password_hash=$2 WHERE id=$1 AND role='member' RETURNING id;
