DELETE FROM challenges WHERE id=$1 AND curator_id=$2 RETURNING id,banner_path;
