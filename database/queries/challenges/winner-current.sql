SELECT id,rank,submission_id FROM winners WHERE challenge_id=$1 ORDER BY rank;
