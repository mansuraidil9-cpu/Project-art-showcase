SELECT count(*)::int AS total FROM sessions WHERE user_id=$1;
