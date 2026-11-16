UPDATE categories SET name=$2,description=$3 WHERE id=$1 RETURNING id,name,description;
