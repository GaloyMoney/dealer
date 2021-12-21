INSERT INTO dealer.internal_transfers 
(
  currency,
  quantity,
  from_account_id,
  to_account_id,
  instrument_id,
  transfer_id,
  success
) 
VALUES 
(
  ${currency},
  ${quantity},
  ${fromAccountId},
  ${toAccountId},
  ${instrumentId},
  ${transferId},
  ${success}
) 
RETURNING *
