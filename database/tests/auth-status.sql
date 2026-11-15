UPDATE users SET curator_status=$2,rejection_reason=$3 WHERE email=$1 AND role='curator';
