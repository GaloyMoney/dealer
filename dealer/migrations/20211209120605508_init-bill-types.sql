-- Up Migration
INSERT INTO "dealer"."bill_types"
("id", "bill_type")
VALUES
(1, 'Transfer' ),
(2, 'Trade' ),
(3, 'Delivery' ),
(4, 'Auto token conversion' ),
(5, 'Liquidation' ),
(6, 'Margin transfer' ),
(7, 'Interest deduction' ),
(8, 'Funding fee' ),
(9, 'ADL' ),
(10, 'Clawback' ),
(11, 'System token conversion' ),
(12, 'Strategy transfer' ),
(13, 'ddh');

-- Reset serial value
select setval(pg_get_serial_sequence('dealer.bill_types', 'id'), (select max(id) from "dealer"."bill_types")); 

-- Down Migration
TRUNCATE TABLE "dealer"."bill_types";
