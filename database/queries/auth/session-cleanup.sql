DELETE FROM sessions WHERE expires_at <= now();
DELETE FROM auth_limits WHERE expires_at <= now();
