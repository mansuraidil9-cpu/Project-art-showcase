UPDATE artworks SET title=$3,description=$4,category_id=$5
WHERE id=$1 AND member_id=$2 RETURNING id,file_path;
