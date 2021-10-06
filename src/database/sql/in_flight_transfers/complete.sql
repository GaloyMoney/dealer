UPDATE dealer.in_flight 
SET is_completed = true
WHERE address = ${address}
AND is_completed != true
RETURNING *
