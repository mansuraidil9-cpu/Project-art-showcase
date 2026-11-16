INSERT INTO artworks(member_id,category_id,title,description,file_path,media_type)
VALUES($1,$2,$3,'Karya sementara untuk pengujian moderasi.',$4,$5) RETURNING id,file_path;
