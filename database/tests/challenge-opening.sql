UPDATE challenges SET starts_at=clock_timestamp()+interval '1 second',ends_at=clock_timestamp()+interval '1 hour'
WHERE id=$1 RETURNING starts_at;
