UPDATE challenges SET starts_at=clock_timestamp()-interval '1 hour',ends_at=clock_timestamp()+$2::interval WHERE id=$1 RETURNING ends_at;
