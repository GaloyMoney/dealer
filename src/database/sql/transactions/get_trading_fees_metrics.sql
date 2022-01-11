SELECT
    coalesce(round(sum(tx.fee) * 100000000, 0), 0) AS trading_fees_total_in_sats,

    coalesce(round(sum(tx.fee) FILTER (WHERE bst.bill_subtype = 'Buy') * 100000000, 0), 0) AS trading_fees_buy_in_sats,
    count(*) FILTER (WHERE bst.bill_subtype = 'Buy') AS trading_fees_buy_count,

    coalesce(round(sum(tx.fee) FILTER (WHERE bst.bill_subtype = 'Sell') * 100000000, 0), 0) AS trading_fees_sell_in_sats,
    count(*) FILTER (WHERE bst.bill_subtype = 'Sell') AS trading_fees_sell_count
FROM dealer.transactions tx
LEFT JOIN dealer.bill_types bt ON bt.id = tx.bill_type_id
LEFT JOIN dealer.bill_subtypes bst ON bst.id = tx.bill_subtype_id
WHERE bt.bill_type = 'Trade'
