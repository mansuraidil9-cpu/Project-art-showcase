DELETE FROM users WHERE email=$1 AND role IN ('member','curator');
