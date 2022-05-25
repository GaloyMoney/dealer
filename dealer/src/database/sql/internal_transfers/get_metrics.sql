SELECT
    count(*) AS total_internal_transfers_count,
    count(*) FILTER (WHERE eatf.account_name = 'Unified account' and eatt.account_name = 'FUNDING' and intx.success = true ) AS trading_to_funding_success_count,
    count(*) FILTER (WHERE eatf.account_name = 'Unified account' and eatt.account_name = 'FUNDING' and intx.success = false) AS trading_to_funding_fail_count,
    count(*) FILTER (WHERE eatf.account_name = 'FUNDING' and eatt.account_name = 'Unified account' and intx.success = true ) AS funding_to_trading_success_count,
    count(*) FILTER (WHERE eatf.account_name = 'FUNDING' and eatt.account_name = 'Unified account' and intx.success = false) AS funding_to_trading_fail_count
FROM dealer.internal_transfers intx
LEFT JOIN dealer.exchange_account_types eatf ON eatf.id = intx.from_account_id
LEFT JOIN dealer.exchange_account_types eatt ON eatt.id = intx.to_account_id
