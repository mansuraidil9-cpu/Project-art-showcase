BEGIN;
INSERT INTO categories(id,name,description) VALUES
 (6,'Arsip Pribadi','Kategori tambahan yang dibuat pengguna.'),
 (100,'Seni Lukis','Deskripsi kategori lukis yang sudah disunting pengguna.');
ALTER TABLE artworks DISABLE TRIGGER artworks_file_immutable;
UPDATE artworks SET title='Catatan Pribadi dari Pesisir' WHERE id=2;
UPDATE artworks SET file_path='/uploads/00000000-0000-4000-8000-000000000005.webp',media_type='image/webp' WHERE id=5;
UPDATE artworks SET member_id=2 WHERE id=6;
ALTER TABLE artworks ENABLE TRIGGER artworks_file_immutable;
UPDATE challenges SET banner_path='/uploads/00000000-0000-4000-8000-000000000003.webp' WHERE id=3;
COMMIT;
