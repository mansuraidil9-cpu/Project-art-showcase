SELECT a.id FROM artworks a
WHERE a.id IN (
 SELECT s.artwork_id FROM submissions s WHERE s.challenge_id=$1
 AND (s.id=ANY($2::integer[]) OR EXISTS(SELECT 1 FROM winners w WHERE w.submission_id=s.id))
)
ORDER BY a.id FOR UPDATE OF a;
