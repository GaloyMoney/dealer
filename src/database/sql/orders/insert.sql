INSERT INTO dealer.orders 
(
  instrument_id,
  order_type_id,
  side,
  quantity,
  trade_mode,
  position_side,
  status_code,
  status_message,
  order_id,
  client_order_id,
  success
) 
VALUES 
(
  ${instrumentId},
  (SELECT id FROM dealer.order_types WHERE order_type = ${orderType}),
  ${side},
  ${quantity},
  ${tradeMode},
  ${positionSide},
  ${statusCode},
  ${statusMessage},
  ${orderId},
  ${clientOrderId},
  ${success}
) 
RETURNING *
