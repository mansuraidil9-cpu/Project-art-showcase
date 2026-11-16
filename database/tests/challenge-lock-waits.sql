SELECT count(*)::integer AS total FROM pg_stat_activity
WHERE datname=current_database() AND pid<>pg_backend_pid() AND wait_event_type='Lock'
AND query LIKE '%FROM challenges c JOIN users u%' AND query LIKE '%FOR UPDATE%';
