INSERT INTO dealer.external_transfers 
(
  is_deposit_not_withdrawal,
  currency,
  quantity,
  destination_address_type_id,
  to_address,
  fund_password_md5,
  fee,
  chain,
  transfer_id,
  success
) 
VALUES 
(
  ${isDepositNotWithdrawal},
  ${currency},
  ${quantity},
  ${destinationAddressTypeId},
  ${toAddress},
  ${fundPasswordMd5},
  ${fee},
  COALESCE( NULLIF(${chain}, '') , 'Internal' ),
  ${transferId},
  ${success}
) 
RETURNING *
