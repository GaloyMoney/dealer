SELECT
    count(*) AS total,
    count(*) FILTER (WHERE ifl.is_deposit_on_exchange = true and ifl.is_completed = true) AS completed_deposit_count,
    count(*) FILTER (WHERE ifl.is_deposit_on_exchange = false and ifl.is_completed = true) AS completed_withdrawal_count,
    count(*) FILTER (WHERE ifl.is_deposit_on_exchange = true and ifl.is_completed = false) AS pending_deposit_count,
    count(*) FILTER (WHERE ifl.is_deposit_on_exchange = false and ifl.is_completed = false) AS pending_withdrawal_count
FROM dealer.in_flight ifl
