SELECT cm.id,cm.body,cm.created_at,u.display_name,u.id AS member_id
FROM comments cm JOIN users u ON u.id=cm.member_id WHERE cm.artwork_id=$1 ORDER BY cm.created_at,cm.id;
