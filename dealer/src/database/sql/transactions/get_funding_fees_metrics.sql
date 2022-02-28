SELECT
    coalesce(round(sum(tx.pnl) * 100000000, 0), 0) AS funding_fees_total_in_sats,

    coalesce(round(sum(tx.pnl) FILTER (WHERE bst.bill_subtype = 'Funding fee expense') * 100000000, 0), 0) AS funding_fees_expense_in_sats,
    count(*) FILTER (WHERE bst.bill_subtype = 'Funding fee expense') AS funding_fees_expense_count,

    coalesce(round(sum(tx.pnl) FILTER (WHERE bst.bill_subtype = 'Funding fee income') * 100000000, 0), 0) AS funding_fees_income_in_sats,
    count(*) FILTER (WHERE bst.bill_subtype = 'Funding fee income') AS funding_fees_income_count
FROM dealer.transactions tx
LEFT JOIN dealer.bill_types bt ON bt.id = tx.bill_type_id
LEFT JOIN dealer.bill_subtypes bst ON bst.id = tx.bill_subtype_id
WHERE bt.bill_type = 'Funding fee'
