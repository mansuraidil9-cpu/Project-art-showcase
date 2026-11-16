UPDATE users SET curator_status=$2::varchar,rejection_reason=$3
WHERE id=$1 AND role='curator' AND curator_status='pending'
RETURNING id,display_name,curator_status;
