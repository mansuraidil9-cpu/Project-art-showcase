DELETE FROM tags WHERE name=ANY($1::text[]) AND NOT EXISTS(SELECT 1 FROM artwork_tags at WHERE at.tag_id=tags.id);
