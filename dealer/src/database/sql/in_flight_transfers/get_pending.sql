SELECT * 
FROM dealer.in_flight 
WHERE is_completed = false
ORDER BY updated_timestamp DESC
