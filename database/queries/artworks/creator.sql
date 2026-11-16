SELECT id,display_name,avatar_path,bio,website_url,instagram_url,behance_url FROM users WHERE id=$1 AND role='member';
