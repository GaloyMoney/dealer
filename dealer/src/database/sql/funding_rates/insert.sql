INSERT INTO dealer.funding_rates 
(
  timestamp,
  funding_time,
  instrument_id,
  exchange_id,
  funding_rate
) 
VALUES 
(
  to_timestamp(${fundingTime} / 1000.),
  ${fundingTime},
  ${instrumentId},
  (SELECT id FROM dealer.exchanges WHERE exchange_name = lower(${exchangeName})),
  ${fundingRate}
) 
RETURNING *
