-- Up Migration
INSERT INTO "dealer"."bill_subtypes"
("id", "bill_subtype")
VALUES
(1, 'Buy' ),
(2, 'Sell' ),
(3, 'Open long' ),
(4, 'Open short' ),
(5, 'Close long' ),
(6, 'Close short' ),
(9, 'Interest deduction for Market loans' ),
(11, 'Transfer in' ),
(12, 'Transfer out' ),
(14, 'Interest deduction for VIP loans' ),
(160, 'Manual margin increase' ),
(161, 'Manual margin decrease' ),
(162, 'Auto margin increase' ),
(110, 'Auto buy OR Liquidation transfer in' ),
(111, 'Auto sell OR Liquidation transfer out' ),
(118, 'System token conversion transfer in' ),
(119, 'System token conversion transfer out' ),
(100, 'Partial liquidation close long' ),
(101, 'Partial liquidation close short' ),
(102, 'Partial liquidation buy' ),
(103, 'Partial liquidation sell' ),
(104, 'Liquidation long' ),
(105, 'Liquidation short' ),
(106, 'Liquidation buy' ),
(107, 'Liquidation sell' ),
-- (110, 'Liquidation transfer in' ),
-- (111, 'Liquidation transfer out' ),
(125, 'ADL close long' ),
(126, 'ADL close short' ),
(127, 'ADL buy' ),
(128, 'ADL sell' ),
(131, 'ddh buy' ),
(132, 'ddh sell' ),
(170, 'Exercised' ),
(171, 'Counterparty exercised' ),
(172, 'Expired OTM' ),
(112, 'Delivery long' ),
(113, 'Delivery short' ),
(117, 'Delivery/Exercise clawback' ),
(173, 'Funding fee expense' ),
(174, 'Funding fee income' ),
(200, 'System transfer in' ),
(201, 'Manually transfer in' ),
(202, 'System transfer out' ),
(203, 'Manually transfer out');

-- Reset serial value
select setval(pg_get_serial_sequence('dealer.bill_subtypes', 'id'), (select max(id) from "dealer"."bill_subtypes")); 

-- Down Migration
TRUNCATE TABLE "dealer"."bill_subtypes";
