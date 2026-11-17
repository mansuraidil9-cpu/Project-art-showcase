SELECT ends_at<clock_timestamp() AS ended FROM challenges WHERE id=$1;
