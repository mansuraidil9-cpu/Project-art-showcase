DELETE FROM artworks WHERE id=$1 AND member_id=$2 RETURNING id,file_path;
