SELECT (SELECT count(*)::integer FROM categories WHERE name=$1) AS categories, (SELECT count(*)::integer FROM tags WHERE name=$1) AS tags;

