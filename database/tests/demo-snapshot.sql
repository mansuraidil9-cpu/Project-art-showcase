SELECT jsonb_build_object(
 'users', (SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY id),'[]'::jsonb) FROM users t),
 'sessions', (SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY token_hash),'[]'::jsonb) FROM sessions t),
 'auth_limits', (SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY key),'[]'::jsonb) FROM auth_limits t),
 'categories', (SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY id),'[]'::jsonb) FROM categories t),
 'artworks', (SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY id),'[]'::jsonb) FROM artworks t),
 'tags', (SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY id),'[]'::jsonb) FROM tags t),
 'artwork_tags', (SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY artwork_id,tag_id),'[]'::jsonb) FROM artwork_tags t),
 'likes', (SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY member_id,artwork_id),'[]'::jsonb) FROM likes t),
 'favorites', (SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY member_id,artwork_id),'[]'::jsonb) FROM favorites t),
 'comments', (SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY id),'[]'::jsonb) FROM comments t),
 'reports', (SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY id),'[]'::jsonb) FROM reports t),
 'challenges', (SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY id),'[]'::jsonb) FROM challenges t),
 'submissions', (SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY id),'[]'::jsonb) FROM submissions t),
 'winners', (SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY id),'[]'::jsonb) FROM winners t)
) AS data;
