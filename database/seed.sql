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
INSERT INTO artworks(id,member_id,category_id,title,description,file_path,media_type) VALUES
(1,2,1,'Senja di Tanah Timur','Studi ilustrasi lanskap dengan bentuk geometris dan palet warna tanah.','/examples/art-01.svg','image/svg+xml'),
(2,3,3,'Ritme Pesisir','Komposisi grafis yang menerjemahkan irama ombak menjadi garis dan bidang.','/examples/art-02.svg','image/svg+xml'),
(3,4,3,'Ruang untuk Tumbuh','Eksplorasi keseimbangan bentuk organik dalam ruang yang sederhana.','/examples/art-03.svg','image/svg+xml'),
(4,2,1,'Kebun Setelah Hujan','Lapisan daun dan cahaya yang terinspirasi halaman rumah di Makassar.','/examples/art-04.svg','image/svg+xml'),
(5,3,3,'Jejak Angin Laut','Interpretasi abstrak gerakan angin di antara layar perahu.','/examples/art-05.svg','image/svg+xml'),
(6,4,1,'Percakapan Bentuk','Studi hubungan lingkaran, garis, dan bidang dalam satu bingkai.','/examples/art-06.svg','image/svg+xml')
ON CONFLICT DO NOTHING;
INSERT INTO tags(id,name) VALUES (1,'geometris'),(2,'makassar'),(3,'alam'),(4,'eksperimen'),(5,'pesisir') ON CONFLICT DO NOTHING;
INSERT INTO artwork_tags(artwork_id,tag_id) VALUES (1,1),(1,2),(2,5),(3,1),(4,3),(5,5),(6,4) ON CONFLICT DO NOTHING;
INSERT INTO likes(member_id,artwork_id) VALUES (2,2),(2,3),(3,1),(3,3),(4,1) ON CONFLICT DO NOTHING;
INSERT INTO favorites(member_id,artwork_id) VALUES (2,2),(3,4),(4,1) ON CONFLICT DO NOTHING;
INSERT INTO comments(id,member_id,artwork_id,body) VALUES
(1,3,1,'Pilihan warna tanahnya membuat suasana senjanya terasa hangat.'),
(2,2,2,'Susunan garisnya mengingatkan saya pada ombak di Losari.')
ON CONFLICT DO NOTHING;
INSERT INTO reports(id,member_id,artwork_id,reason,details) VALUES
(1,3,6,'Plagiat','Data simulasi moderasi: mohon periksa kemiripan komposisi dengan referensi yang beredar. Ini bukan tuduhan terhadap kreator nyata.')
ON CONFLICT DO NOTHING;
-- Waktu relatif membuat contoh challenge tetap relevan saat seed pertama dijalankan.
INSERT INTO challenges(id,curator_id,title,description,rules,prize,starts_at,ends_at,banner_path) VALUES
(1,5,'Warna Kota Kita','Ceritakan sudut kota yang dekat dengan keseharianmu.','Karya orisinal. Satu karya per peserta. Sertakan cerita di deskripsi.','Pameran daring dan sertifikat komunitas.',now()-interval '2 days',now()+interval '7 days','/examples/art-02.svg'),
(2,5,'Bentuk yang Bercerita','Temukan cerita dalam pertemuan bentuk sederhana.','Gunakan karya orisinal. Semua medium visual diterima.','Ulasan portofolio bersama Kolektif Timur.',now()-interval '14 days',now()-interval '2 days','/examples/art-03.svg'),
(3,5,'Hijau di Sekitar Kita','Amati kembali hubungan manusia dengan ruang hijau.','Karya orisinal bertema alam dan lingkungan.','Publikasi karya di katalog komunitas.',now()+interval '3 days',now()+interval '12 days','/examples/art-04.svg')
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

