SELECT id,title,file_path FROM artworks WHERE id=$1 FOR UPDATE;
