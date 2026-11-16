UPDATE users SET display_name=$2,bio=$3,website_url=$4,instagram_url=$5,behance_url=$6,avatar_path=$7
WHERE id=$1 AND role='member' RETURNING id;
