SELECT count(*)::integer AS total FROM submissions WHERE member_id=$1;
