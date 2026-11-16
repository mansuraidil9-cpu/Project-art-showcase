SELECT avatar_path AS file_path FROM users WHERE id=$1 AND avatar_path IS NOT NULL
UNION SELECT file_path FROM artworks WHERE member_id=$1
UNION SELECT banner_path FROM challenges WHERE curator_id=$1;
