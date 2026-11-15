SELECT
 (SELECT count(*)::integer FROM users WHERE role='admin') AS admins,
 (SELECT count(*)::integer FROM users WHERE role='member') AS members,
 (SELECT count(*)::integer FROM users WHERE role='curator') AS curators,
 (SELECT count(*)::integer FROM artworks) AS artworks,
 (SELECT count(*)::integer FROM reports WHERE status='pending') AS pending_reports,
 (SELECT count(*)::integer FROM challenges WHERE starts_at <= now() AND ends_at > now()) AS active_challenges;

