SELECT * 
FROM dealer.in_flight 
WHERE is_deposit_on_exchange = true
AND is_completed = false
ORDER BY updated_timestamp DESC
