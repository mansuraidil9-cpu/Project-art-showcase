UPDATE sessions SET created_at=now()-interval '2 days',expires_at=now()-interval '1 day'
WHERE user_id=(SELECT id FROM users WHERE email=$1);
