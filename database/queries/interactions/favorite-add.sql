INSERT INTO favorites(member_id,artwork_id) VALUES($1,$2) ON CONFLICT DO NOTHING;
