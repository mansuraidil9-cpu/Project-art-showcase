UPDATE users SET email=$2 WHERE id=$1 AND role='member' RETURNING id;
