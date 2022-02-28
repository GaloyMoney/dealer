-- Up Migration
INSERT INTO "dealer"."destination_address_types"
("id", "destination_address_type_name")
VALUES
(3, 'OKEx'),
(4, 'Digital currency address');

-- Reset serial value
select setval(pg_get_serial_sequence('dealer.destination_address_types', 'id'), (select max(id) from "dealer"."destination_address_types")); 

-- Down Migration
TRUNCATE TABLE "dealer"."destination_address_types";
