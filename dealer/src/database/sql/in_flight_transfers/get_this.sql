SELECT * 
FROM dealer.in_flight 
WHERE address = ${address}
ORDER BY updated_timestamp DESC
LIMIT 1
