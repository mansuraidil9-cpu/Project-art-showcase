SELECT count(*)::integer AS total FROM submissions WHERE challenge_id=$1;
