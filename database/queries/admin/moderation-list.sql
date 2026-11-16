SELECT a.id,a.title,a.file_path,a.media_type,a.member_id,u.display_name,c.name AS category,
 q.report_count,q.reasons,q.oldest_report
FROM (
 SELECT artwork_id,count(*)::integer AS report_count,
 array_agg(DISTINCT reason ORDER BY reason) AS reasons,min(created_at) AS oldest_report
 FROM reports WHERE status='pending' GROUP BY artwork_id
) q JOIN artworks a ON a.id=q.artwork_id
JOIN users u ON u.id=a.member_id JOIN categories c ON c.id=a.category_id
ORDER BY q.oldest_report,a.id LIMIT $1 OFFSET $2;
