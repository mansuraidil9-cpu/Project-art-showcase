-- Fixture ini hanya dijalankan pada database pengujian terpisah.
BEGIN;
ALTER TABLE artworks DISABLE TRIGGER artworks_file_immutable;
UPDATE artworks a
SET member_id=v.member_id,category_id=v.category_id,title=v.title,
    description=v.description,file_path=v.file_path,media_type='image/svg+xml'
FROM (VALUES
 (1,2,1,'Senja di Tanah Timur','Studi ilustrasi lanskap dengan bentuk geometris dan palet warna tanah.','/examples/art-01.svg'),
 (2,3,3,'Ritme Pesisir','Komposisi grafis yang menerjemahkan irama ombak menjadi garis dan bidang.','/examples/art-02.svg'),
 (3,4,3,'Ruang untuk Tumbuh','Eksplorasi keseimbangan bentuk organik dalam ruang yang sederhana.','/examples/art-03.svg'),
 (4,2,1,'Kebun Setelah Hujan','Lapisan daun dan cahaya yang terinspirasi halaman rumah di Makassar.','/examples/art-04.svg'),
 (5,3,3,'Jejak Angin Laut','Interpretasi abstrak gerakan angin di antara layar perahu.','/examples/art-05.svg'),
 (6,4,1,'Percakapan Bentuk','Studi hubungan lingkaran, garis, dan bidang dalam satu bingkai.','/examples/art-06.svg')
) AS v(id,member_id,category_id,title,description,file_path)
WHERE a.id=v.id;
ALTER TABLE artworks ENABLE TRIGGER artworks_file_immutable;
DELETE FROM categories WHERE name IN ('Seni Lukis','Cetak Grafis','Seni Patung');
DELETE FROM artwork_tags;
DELETE FROM tags;
INSERT INTO tags(id,name) VALUES (1,'geometris'),(2,'makassar'),(3,'alam'),(4,'eksperimen'),(5,'pesisir');
INSERT INTO artwork_tags(artwork_id,tag_id) VALUES (1,1),(1,2),(2,5),(3,1),(4,3),(5,5),(6,4);
SELECT setval(pg_get_serial_sequence('tags','id'),5);
UPDATE challenges c SET banner_path=v.path
FROM (VALUES (1,'/examples/art-02.svg'),(2,'/examples/art-03.svg'),(3,'/examples/art-04.svg')) AS v(id,path)
WHERE c.id=v.id;
COMMIT;
