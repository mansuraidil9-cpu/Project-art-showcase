INSERT INTO artworks(member_id,category_id,title,description,file_path,media_type)
VALUES($1,$2,$3,$4,$5,'image/webp') RETURNING id,file_path;
