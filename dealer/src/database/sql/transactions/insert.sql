INSERT INTO dealer.transactions 
(
  balance,
  balance_change,
  bill_id,
  currency,
  execution_type,
  fee,
  from_account_id,
  instrument_id,
  instrument_type,
  margin_mode,
  notes,
  order_id,
  pnl,
  position_balance,
  position_balance_change,
  bill_subtype_id,
  quantity,
  to_account_id,
  timestamp,
  bill_type_id
) 
VALUES 
(
  ${balance},
  ${balanceChange},
  ${billId},
  ${currency},
  ${executionType},
  ${fee},
  (SELECT id FROM dealer.exchange_account_types where account_name = '${fromAccountId}'),
  ${instrumentId},
  ${instrumentType},
  ${marginMode},
  ${notes},
  ${orderId},
  ${pnl},
  ${positionBalance},
  ${positionBalanceChange},
  ${billSubtypeId},
  ${quantity},
  (SELECT id FROM dealer.exchange_account_types where account_name = '${toAccountId}'),
  to_timestamp(${timestamp} / 1000.),
  ${billTypeId}
) 
RETURNING *
