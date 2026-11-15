-- Pemeriksaan manual di Query Tool tanpa menampilkan token atau hash password.
SELECT table_name
FROM information_schema.tables
WHERE table_schema='public' AND table_name IN ('sessions','auth_limits')
ORDER BY table_name;

SELECT u.email,u.role,u.curator_status,
 count(s.token_hash) FILTER (WHERE s.expires_at > now()) AS active_sessions
FROM users u LEFT JOIN sessions s ON s.user_id=u.id
GROUP BY u.id,u.email,u.role,u.curator_status
ORDER BY u.id;
