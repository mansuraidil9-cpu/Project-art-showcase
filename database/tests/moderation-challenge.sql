INSERT INTO challenges(curator_id,title,description,rules,prize,starts_at,ends_at,banner_path)
VALUES($1,'Studi Pesisir Uji','Challenge sementara untuk pengujian statistik.','Karya orisinal.','Sertifikat.',now()+$2::interval,now()+$3::interval,'/examples/art-01.svg') RETURNING id;
