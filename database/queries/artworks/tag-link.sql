INSERT INTO artwork_tags(artwork_id,tag_id) VALUES($1,$2) ON CONFLICT DO NOTHING;
