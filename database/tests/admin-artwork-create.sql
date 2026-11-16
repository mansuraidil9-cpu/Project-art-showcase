INSERT INTO artworks(member_id,category_id,title,description,file_path,media_type)
VALUES($1,$2,'Studi bentuk untuk pengujian Admin','Data sementara untuk menguji penghapusan berelasi.',$3,'image/png') RETURNING id;
