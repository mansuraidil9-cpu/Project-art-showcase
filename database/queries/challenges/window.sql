SELECT starts_at<=clock_timestamp() AS started,ends_at>clock_timestamp() AS open
FROM challenges WHERE id=$1;
