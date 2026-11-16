SELECT id,member_id,category_id,title,description,file_path,media_type
FROM artworks WHERE id=$1 AND member_id=$2 FOR UPDATE;
