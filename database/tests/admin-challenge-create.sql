INSERT INTO challenges(curator_id,title,description,rules,prize,starts_at,ends_at,banner_path)
VALUES($1,'Eksplorasi Bentuk Uji','Challenge sementara untuk pengujian relasi.','Karya orisinal untuk data uji.','Sertifikat contoh.',now()-interval '7 days',now()-interval '1 day','/examples/art-01.svg') RETURNING id;
