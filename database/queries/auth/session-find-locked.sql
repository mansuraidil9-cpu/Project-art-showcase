SELECT u.id,u.email,u.display_name,u.role,u.curator_status,u.rejection_reason
FROM sessions s JOIN users u ON u.id=s.user_id
WHERE s.token_hash=$1 AND s.user_id=$2 AND s.expires_at > now()
FOR UPDATE OF u,s;
