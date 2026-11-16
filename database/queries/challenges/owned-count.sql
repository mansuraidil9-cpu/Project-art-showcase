SELECT count(*)::integer AS total FROM challenges WHERE curator_id=$1;
