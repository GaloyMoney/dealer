SELECT * 
FROM dealer.in_flight 
WHERE is_deposit_on_exchang = false
AND is_completed = false
ORDER BY updated_timestamp DESC
