-- Akun demo memakai password RuangKarya2026! (bcrypt biaya 12).
-- Jalankan setelah schema.sql pada database khusus tugas.
BEGIN;
INSERT INTO users(id,email,password_hash,display_name,role,curator_status,rejection_reason,bio) VALUES
(1,'admin@ruangkarya.test','$2b$12$WXqJXWkptiTPLn.ouMTvb.fBD.EDhUqBhM2FJa4erHV/sUmCXyi86','Admin Ruang Karya','admin',NULL,NULL,'Pengelola komunitas Ruang Karya.'),
(2,'nadia@ruangkarya.test','$2b$12$WXqJXWkptiTPLn.ouMTvb.fBD.EDhUqBhM2FJa4erHV/sUmCXyi86','Nadia Ramadhani','member',NULL,NULL,'Ilustrator di Makassar yang mengamati warna, tumbuhan, dan ruang kota.'),
(3,'fajar@ruangkarya.test','$2b$12$WXqJXWkptiTPLn.ouMTvb.fBD.EDhUqBhM2FJa4erHV/sUmCXyi86','Fajar Pratama','member',NULL,NULL,'Fotografer dan seniman digital yang merekam kehidupan pesisir.'),
(4,'ayu@ruangkarya.test','$2b$12$WXqJXWkptiTPLn.ouMTvb.fBD.EDhUqBhM2FJa4erHV/sUmCXyi86','Ayu Lestari','member',NULL,NULL,'Desainer visual dengan ketertarikan pada bentuk dan tipografi.'),
(5,'kurator@ruangkarya.test','$2b$12$WXqJXWkptiTPLn.ouMTvb.fBD.EDhUqBhM2FJa4erHV/sUmCXyi86','Kolektif Timur','curator','approved',NULL,'Komunitas seni lintas disiplin di Indonesia timur.'),
(6,'pending@ruangkarya.test','$2b$12$WXqJXWkptiTPLn.ouMTvb.fBD.EDhUqBhM2FJa4erHV/sUmCXyi86','Studio Akar','curator','pending',NULL,'Ruang eksplorasi seni dan desain.'),
(7,'rejected@ruangkarya.test','$2b$12$WXqJXWkptiTPLn.ouMTvb.fBD.EDhUqBhM2FJa4erHV/sUmCXyi86','Ruang Rintis','curator','rejected','Informasi lembaga belum lengkap. Silakan lengkapi identitas saat mendaftar kembali.','Komunitas kreatif independen.')
ON CONFLICT DO NOTHING;
INSERT INTO categories(id,name,description) VALUES
(1,'Ilustrasi','Cerita visual melalui gambar dan warna.'),
(2,'Fotografi','Rekaman cahaya, ruang, dan keseharian.'),
(3,'Desain Grafis','Komposisi visual untuk menyampaikan gagasan.'),
(4,'Seni 3D','Eksplorasi bentuk dalam ruang tiga dimensi.'),
(5,'UI/UX','Perancangan pengalaman dan antarmuka digital.')
ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('categories','id'), greatest((SELECT coalesce(max(id),1) FROM categories),1));
INSERT INTO categories(name,description) VALUES
('Seni Lukis','Karya dua dimensi dengan sapuan warna, tekstur, dan komposisi lukisan.'),
('Cetak Grafis','Karya cetak seperti cukil kayu, litografi, dan eksplorasi teknik grafis.'),
('Seni Patung','Karya tiga dimensi melalui pahatan, pemodelan, dan eksplorasi material.')
ON CONFLICT DO NOTHING;
INSERT INTO artworks(id,member_id,category_id,title,description,file_path,media_type)
SELECT v.id,v.member_id,c.id,v.title,v.description,v.file_path,v.media_type
FROM (VALUES
(1,2,'Seni Lukis','Keramaian Boulevard des Capucines','Referensi lukisan Boulevard des Capucines karya Claude Monet. Keramaian jalan Paris dilihat dari ketinggian, dengan pepohonan dan sapuan warna pucat yang membentuk suasana kota. Reproduksi domain publik dari Wikimedia Commons; bukan karya orisinal akun demo.','/examples/hd/boulevard-capucines.webp','image/webp'),
(2,3,'Fotografi','Senja di Pantai Losari','Referensi foto senja di Pantai Losari, Makassar, oleh Khaerunnisa Atikah Syahidah. Matahari berwarna keemasan dan siluet perahu memantul di permukaan air. Sumber Wikimedia Commons, lisensi CC BY-SA 4.0. Versi ini diubah ukuran dan formatnya; bukan karya orisinal akun demo.','/examples/hd/senja-losari.webp','image/webp'),
(3,4,'Seni Lukis','Komposisi Suprematis','Referensi lukisan Suprematist Composition karya Kazimir Malevich. Bidang biru, hijau, hitam, kuning, dan merah disusun miring pada latar terang untuk membentuk keseimbangan yang dinamis. Reproduksi domain publik dari Wikimedia Commons; bukan karya orisinal akun demo.','/examples/hd/komposisi-suprematis.webp','image/webp'),
(4,2,'Seni Lukis','Jembatan di Atas Kolam Teratai','Referensi lukisan The Water-Lily Pond karya Claude Monet. Jembatan melengkung dikelilingi dedaunan hijau, sementara bunga teratai dan pantulan cahaya memenuhi permukaan kolam. Reproduksi domain publik dari Wikimedia Commons; bukan karya orisinal akun demo.','/examples/hd/kolam-teratai-monet.webp','image/webp'),
(5,3,'Cetak Grafis','Gelombang Besar di Kanagawa','Referensi cetak cukil kayu The Great Wave off Kanagawa rancangan Katsushika Hokusai. Gelombang besar melengkung di atas perahu, sementara Gunung Fuji terlihat kecil di kejauhan. Reproduksi domain publik dari Wikimedia Commons; bukan karya orisinal akun demo.','/examples/hd/ombak-kanagawa.webp','image/webp'),
(6,4,'Seni Patung','Venus de Milo dalam Marmer','Referensi patung marmer Venus de Milo dari koleksi Louvre, difoto oleh Caeciliusinhorto. Foto memperlihatkan bentuk tubuh klasik dan lipatan kain pada pahatan marmer. Sumber Wikimedia Commons, lisensi CC BY-SA 4.0. Versi ini diubah ukuran dan formatnya; bukan karya orisinal akun demo.','/examples/hd/venus-de-milo.webp','image/webp')
) AS v(id,member_id,category_name,title,description,file_path,media_type)
JOIN categories c ON lower(c.name)=lower(v.category_name)
ON CONFLICT DO NOTHING;
INSERT INTO tags(name) VALUES ('impresionisme'),('paris'),('kota'),('makassar'),('senja'),('pesisir'),('geometris'),('abstrak'),('suprematisme'),('taman'),('teratai'),('ukiyo-e'),('ombak'),('jepang'),('patung'),('marmer'),('klasik') ON CONFLICT DO NOTHING;
INSERT INTO artwork_tags(artwork_id,tag_id)
SELECT v.artwork_id,t.id FROM (VALUES (1,'impresionisme'),(1,'paris'),(1,'kota'),(2,'makassar'),(2,'senja'),(2,'pesisir'),(3,'geometris'),(3,'abstrak'),(3,'suprematisme'),(4,'taman'),(4,'teratai'),(4,'impresionisme'),(5,'ukiyo-e'),(5,'ombak'),(5,'jepang'),(6,'patung'),(6,'marmer'),(6,'klasik')) AS v(artwork_id,tag_name)
JOIN tags t ON t.name=v.tag_name
JOIN artworks a ON a.id=v.artwork_id AND a.file_path LIKE '/examples/hd/%'
ON CONFLICT DO NOTHING;
INSERT INTO likes(member_id,artwork_id) VALUES (2,2),(2,3),(3,1),(3,3),(4,1) ON CONFLICT DO NOTHING;
INSERT INTO favorites(member_id,artwork_id) VALUES (2,2),(3,4),(4,1) ON CONFLICT DO NOTHING;
INSERT INTO comments(id,member_id,artwork_id,body) VALUES
(1,3,1,'Sapuan warnanya membuat keramaian kota terasa hidup.'),
(2,2,2,'Cahaya sore dan pantulan perahunya membuat suasana Losari terasa dekat.')
ON CONFLICT DO NOTHING;
INSERT INTO reports(id,member_id,artwork_id,reason,details) VALUES
(1,3,6,'Plagiat','Data simulasi moderasi: mohon periksa kemiripan komposisi dengan referensi yang beredar. Ini bukan tuduhan terhadap kreator nyata.')
ON CONFLICT DO NOTHING;
-- Waktu relatif membuat contoh challenge tetap relevan saat seed pertama dijalankan.
INSERT INTO challenges(id,curator_id,title,description,rules,prize,starts_at,ends_at,banner_path) VALUES
(1,5,'Warna Kota Kita','Ceritakan sudut kota yang dekat dengan keseharianmu.','Karya orisinal. Satu karya per peserta. Sertakan cerita di deskripsi.','Pameran daring dan sertifikat komunitas.',now()-interval '2 days',now()+interval '7 days','/examples/hd/boulevard-capucines.webp'),
(2,5,'Bentuk yang Bercerita','Temukan cerita dalam pertemuan bentuk sederhana.','Gunakan karya orisinal. Semua medium visual diterima.','Ulasan portofolio bersama Kolektif Timur.',now()-interval '14 days',now()-interval '2 days','/examples/hd/komposisi-suprematis.webp'),
(3,5,'Hijau di Sekitar Kita','Amati kembali hubungan manusia dengan ruang hijau.','Karya orisinal bertema alam dan lingkungan.','Publikasi karya di katalog komunitas.',now()+interval '3 days',now()+interval '12 days','/examples/hd/kolam-teratai-monet.webp')
ON CONFLICT DO NOTHING;
INSERT INTO submissions(id,challenge_id,member_id,artwork_id,created_at) VALUES
(1,1,2,1,now()-interval '1 day'),
(2,1,3,2,now()-interval '1 day'),
(3,2,4,3,now()-interval '5 days'),
(4,2,2,4,now()-interval '5 days')
ON CONFLICT DO NOTHING;
INSERT INTO winners(id,challenge_id,submission_id,rank) VALUES (1,2,3,1),(2,2,4,2) ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('users','id'), greatest((SELECT coalesce(max(id),1) FROM users),1));
SELECT setval(pg_get_serial_sequence('categories','id'), greatest((SELECT coalesce(max(id),1) FROM categories),1));
SELECT setval(pg_get_serial_sequence('artworks','id'), greatest((SELECT coalesce(max(id),1) FROM artworks),1));
SELECT setval(pg_get_serial_sequence('tags','id'), greatest((SELECT coalesce(max(id),1) FROM tags),1));
SELECT setval(pg_get_serial_sequence('comments','id'), greatest((SELECT coalesce(max(id),1) FROM comments),1));
SELECT setval(pg_get_serial_sequence('reports','id'), greatest((SELECT coalesce(max(id),1) FROM reports),1));
SELECT setval(pg_get_serial_sequence('challenges','id'), greatest((SELECT coalesce(max(id),1) FROM challenges),1));
SELECT setval(pg_get_serial_sequence('submissions','id'), greatest((SELECT coalesce(max(id),1) FROM submissions),1));
SELECT setval(pg_get_serial_sequence('winners','id'), greatest((SELECT coalesce(max(id),1) FROM winners),1));
COMMIT;

