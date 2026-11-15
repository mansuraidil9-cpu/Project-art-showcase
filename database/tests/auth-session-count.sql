SELECT count(*)::integer AS total FROM sessions WHERE user_id=$1;

