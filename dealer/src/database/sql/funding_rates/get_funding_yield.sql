SELECT 
    ROUND(COALESCE(dealer.mul( COALESCE(1 + funding_rate, 1) ) - 1, 0), 15) as  funding_yield,
    ((1. + ROUND(COALESCE(dealer.mul( COALESCE(1 + funding_rate, 1) ) - 1, 0), 15))^(365.25 / COALESCE(NULLIF(${numberOfDays}, 0), 0.0000001))) - 1. as annual_funding_yield
FROM dealer.funding_rates 
WHERE funding_rate IS NOT NULL
AND exchange_id = (SELECT id FROM dealer.exchanges where exchange_name = lower(${exchangeName}))
AND timestamp >= current_timestamp - make_interval(days => ${numberOfDays});
