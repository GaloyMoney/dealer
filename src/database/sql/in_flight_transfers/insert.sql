INSERT INTO dealer.in_flight
(is_deposit_on_exchange, address, transfer_size_in_sats, memo, is_completed) 
VALUES 
(${isDepositOnExchange}, ${address}, ${transferSizeInSats}, ${memo}, ${isCompleted})
RETURNING *
