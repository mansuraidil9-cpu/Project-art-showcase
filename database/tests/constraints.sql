-- Jalankan setelah seed.sql. Semua perubahan dibatalkan.
BEGIN;
CREATE OR REPLACE FUNCTION pg_temp.expect_failure(statement text, expected_code text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 BEGIN
  EXECUTE statement;
 EXCEPTION WHEN OTHERS THEN
  IF SQLSTATE = expected_code THEN RETURN; END IF;
  RAISE;
 END;
 RAISE EXCEPTION 'Tes gagal: perintah seharusnya ditolak: %', statement;
END;
$$;
SELECT pg_temp.expect_failure($test$INSERT INTO categories(name) VALUES('ilustrasi')$test$,'23505');
SELECT pg_temp.expect_failure($test$INSERT INTO users(email,password_hash,display_name,role) SELECT email,password_hash,'Duplikat','member' FROM users WHERE id=1$test$,'23505');
SELECT pg_temp.expect_failure($test$INSERT INTO likes(member_id,artwork_id) VALUES(2,2)$test$,'23505');
SELECT pg_temp.expect_failure($test$INSERT INTO favorites(member_id,artwork_id) VALUES(2,2)$test$,'23505');
SELECT pg_temp.expect_failure($test$INSERT INTO reports(member_id,artwork_id,reason,details) VALUES(3,6,'Plagiat','Laporan kedua')$test$,'23505');
SELECT pg_temp.expect_failure($test$INSERT INTO submissions(challenge_id,member_id,artwork_id) VALUES(1,2,4)$test$,'23505');
SELECT pg_temp.expect_failure($test$INSERT INTO submissions(challenge_id,member_id,artwork_id) VALUES(3,3,1)$test$,'23503');
SELECT pg_temp.expect_failure($test$INSERT INTO winners(challenge_id,submission_id,rank) VALUES(2,1,3)$test$,'23503');
SELECT pg_temp.expect_failure($test$INSERT INTO winners(challenge_id,submission_id,rank) VALUES(2,4,1)$test$,'23505');
SELECT pg_temp.expect_failure($test$INSERT INTO winners(challenge_id,submission_id,rank) VALUES(2,3,3)$test$,'23505');
SELECT pg_temp.expect_failure($test$INSERT INTO winners(challenge_id,submission_id,rank) VALUES(2,4,4)$test$,'23514');
SELECT pg_temp.expect_failure($test$UPDATE challenges SET ends_at=starts_at WHERE id=1$test$,'23514');
SELECT pg_temp.expect_failure($test$UPDATE artworks SET file_path='/uploads/pengganti.png' WHERE id=1$test$,'23514');
SELECT pg_temp.expect_failure($test$DELETE FROM categories WHERE id=1$test$,'23001');
SELECT pg_temp.expect_failure($test$UPDATE users SET curator_status=NULL WHERE id=5$test$,'23514');
SELECT pg_temp.expect_failure($test$UPDATE users SET rejection_reason='' WHERE id=7$test$,'23514');
SELECT '16 constraint diperiksa; perubahan dibatalkan.' AS hasil;
ROLLBACK;

