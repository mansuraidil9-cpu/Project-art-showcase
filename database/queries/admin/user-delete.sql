DELETE FROM users WHERE id=$1 AND id<>$2 AND role IN ('member','curator') RETURNING id;
