SELECT count(*)::integer AS total FROM users WHERE ($1::text='' OR role=$1::text);
