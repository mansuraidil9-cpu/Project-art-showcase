SELECT count(*)::integer AS total FROM challenges c JOIN users u ON u.id=c.curator_id
WHERE u.role='curator' AND u.curator_status='approved'
AND ($1::text='' OR c.title ILIKE $1 OR u.display_name ILIKE $1)
AND ($2::text='all' OR ($2='active' AND c.starts_at<=now() AND c.ends_at>now())
 OR ($2='upcoming' AND c.starts_at>now()) OR ($2='ended' AND c.ends_at<=now()));
