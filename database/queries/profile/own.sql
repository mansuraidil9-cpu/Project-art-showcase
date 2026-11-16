SELECT id,display_name,bio,avatar_path,website_url,instagram_url,behance_url FROM users WHERE id=$1 AND role='member';
