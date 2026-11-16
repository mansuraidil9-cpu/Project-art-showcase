SELECT count(*)::integer AS total FROM favorites WHERE member_id=$1;
