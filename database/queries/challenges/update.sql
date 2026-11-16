UPDATE challenges SET title=$3,description=$4,rules=$5,prize=$6,starts_at=$7,ends_at=$8,banner_path=$9
WHERE id=$1 AND curator_id=$2 RETURNING id,banner_path;
