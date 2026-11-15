INSERT INTO auth_limits(key,attempts,expires_at)
VALUES($1,1,now()+interval '15 minutes')
ON CONFLICT(key) DO UPDATE SET
 attempts=CASE WHEN auth_limits.expires_at <= now() THEN 1 ELSE auth_limits.attempts+1 END,
 expires_at=CASE WHEN auth_limits.expires_at <= now() THEN now()+interval '15 minutes' ELSE auth_limits.expires_at END
RETURNING attempts;
