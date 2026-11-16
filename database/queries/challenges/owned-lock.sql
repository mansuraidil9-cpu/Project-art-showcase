SELECT c.*,EXISTS(SELECT 1 FROM winners w WHERE w.challenge_id=c.id) AS has_winners
FROM challenges c WHERE c.id=$1 AND c.curator_id=$2 FOR UPDATE OF c;
