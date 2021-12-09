-- Up Migration
INSERT INTO "dealer"."exchange_account_types"
("id", "account_name")
VALUES
(1, 'SPOT'),
(3, 'FUTURES'),
(5, 'MARGIN'),
(6, 'FUNDING'),
(9, 'SWAP'),
(12, 'OPTION'),
(18, 'Unified account');

-- Reset serial value
select setval(pg_get_serial_sequence('dealer.exchange_account_types', 'id'), (select max(id) from "dealer"."exchange_account_types")); 

-- Down Migration
TRUNCATE TABLE "dealer"."exchange_account_types";
