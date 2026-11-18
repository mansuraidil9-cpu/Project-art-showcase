-- Perbarui karya contoh lama yang judul, pemilik, dan jalur berkasnya masih asli.
-- Karya unggahan serta karya contoh yang telah diganti judulnya tidak ditimpa.
BEGIN;
-- Permintaan aplikasi menunggu sampai pembaruan contoh selesai.
LOCK TABLE artworks IN ACCESS EXCLUSIVE MODE;
ALTER TABLE artworks DISABLE TRIGGER artworks_file_immutable;
INSERT INTO categories(name,description) VALUES
('Seni Lukis','Karya dua dimensi dengan sapuan warna, tekstur, dan komposisi lukisan.'),
('Cetak Grafis','Karya cetak seperti cukil kayu, litografi, dan eksplorasi teknik grafis.'),
('Seni Patung','Karya tiga dimensi melalui pahatan, pemodelan, dan eksplorasi material.')
ON CONFLICT DO NOTHING;
CREATE TEMP TABLE atelier_demo_changes(id integer PRIMARY KEY, tags text[]) ON COMMIT DROP;
WITH changed AS (
 UPDATE artworks a
 SET title=v.new_title,description=v.description,category_id=c.id,
     file_path=v.new_path,media_type='image/webp',updated_at=clock_timestamp()
 FROM users u,categories c,(VALUES
(1,'nadia@ruangkarya.test','Senja di Tanah Timur','/examples/art-01.svg','Seni Lukis','Keramaian Boulevard des Capucines','Referensi lukisan Boulevard des Capucines karya Claude Monet. Keramaian jalan Paris dilihat dari ketinggian, dengan pepohonan dan sapuan warna pucat yang membentuk suasana kota. Reproduksi domain publik dari Wikimedia Commons; bukan karya orisinal akun demo.','/examples/hd/boulevard-capucines.webp',ARRAY['impresionisme','paris','kota']::text[]),
(2,'fajar@ruangkarya.test','Ritme Pesisir','/examples/art-02.svg','Fotografi','Senja di Pantai Losari','Referensi foto senja di Pantai Losari, Makassar, oleh Khaerunnisa Atikah Syahidah. Matahari berwarna keemasan dan siluet perahu memantul di permukaan air. Sumber Wikimedia Commons, lisensi CC BY-SA 4.0. Versi ini diubah ukuran dan formatnya; bukan karya orisinal akun demo.','/examples/hd/senja-losari.webp',ARRAY['makassar','senja','pesisir']::text[]),
(3,'ayu@ruangkarya.test','Ruang untuk Tumbuh','/examples/art-03.svg','Seni Lukis','Komposisi Suprematis','Referensi lukisan Suprematist Composition karya Kazimir Malevich. Bidang biru, hijau, hitam, kuning, dan merah disusun miring pada latar terang untuk membentuk keseimbangan yang dinamis. Reproduksi domain publik dari Wikimedia Commons; bukan karya orisinal akun demo.','/examples/hd/komposisi-suprematis.webp',ARRAY['geometris','abstrak','suprematisme']::text[]),
(4,'nadia@ruangkarya.test','Kebun Setelah Hujan','/examples/art-04.svg','Seni Lukis','Jembatan di Atas Kolam Teratai','Referensi lukisan The Water-Lily Pond karya Claude Monet. Jembatan melengkung dikelilingi dedaunan hijau, sementara bunga teratai dan pantulan cahaya memenuhi permukaan kolam. Reproduksi domain publik dari Wikimedia Commons; bukan karya orisinal akun demo.','/examples/hd/kolam-teratai-monet.webp',ARRAY['taman','teratai','impresionisme']::text[]),
(5,'fajar@ruangkarya.test','Jejak Angin Laut','/examples/art-05.svg','Cetak Grafis','Gelombang Besar di Kanagawa','Referensi cetak cukil kayu The Great Wave off Kanagawa rancangan Katsushika Hokusai. Gelombang besar melengkung di atas perahu, sementara Gunung Fuji terlihat kecil di kejauhan. Reproduksi domain publik dari Wikimedia Commons; bukan karya orisinal akun demo.','/examples/hd/ombak-kanagawa.webp',ARRAY['ukiyo-e','ombak','jepang']::text[]),
(6,'ayu@ruangkarya.test','Percakapan Bentuk','/examples/art-06.svg','Seni Patung','Venus de Milo dalam Marmer','Referensi patung marmer Venus de Milo dari koleksi Louvre, difoto oleh Caeciliusinhorto. Foto memperlihatkan bentuk tubuh klasik dan lipatan kain pada pahatan marmer. Sumber Wikimedia Commons, lisensi CC BY-SA 4.0. Versi ini diubah ukuran dan formatnya; bukan karya orisinal akun demo.','/examples/hd/venus-de-milo.webp',ARRAY['patung','marmer','klasik']::text[])
 ) AS v(id,owner_email,old_title,old_path,category_name,new_title,description,new_path,tags)
 WHERE a.id=v.id AND a.member_id=u.id AND u.email=v.owner_email
   AND a.title=v.old_title AND a.file_path=v.old_path AND a.media_type='image/svg+xml'
   AND lower(c.name)=lower(v.category_name)
 RETURNING a.id,v.tags
)
INSERT INTO atelier_demo_changes(id,tags) SELECT id,tags FROM changed;
ALTER TABLE artworks ENABLE TRIGGER artworks_file_immutable;
DELETE FROM artwork_tags t USING atelier_demo_changes d WHERE t.artwork_id=d.id;
INSERT INTO tags(name) SELECT DISTINCT unnest(tags) FROM atelier_demo_changes ON CONFLICT DO NOTHING;
INSERT INTO artwork_tags(artwork_id,tag_id)
SELECT d.id,t.id FROM atelier_demo_changes d CROSS JOIN LATERAL unnest(d.tags) AS tag(name)
JOIN tags t ON t.name=tag.name ON CONFLICT DO NOTHING;
UPDATE challenges c SET banner_path=v.new_path,updated_at=clock_timestamp()
FROM users u,(VALUES
 (1,'Warna Kota Kita','/examples/art-02.svg','/examples/hd/boulevard-capucines.webp'),
 (2,'Bentuk yang Bercerita','/examples/art-03.svg','/examples/hd/komposisi-suprematis.webp'),
 (3,'Hijau di Sekitar Kita','/examples/art-04.svg','/examples/hd/kolam-teratai-monet.webp')
) AS v(id,title,old_path,new_path)
WHERE c.id=v.id AND c.curator_id=u.id AND u.email='kurator@ruangkarya.test'
AND c.title=v.title AND c.banner_path=v.old_path;
SELECT count(*)::integer AS artworks_updated FROM atelier_demo_changes;
COMMIT;
