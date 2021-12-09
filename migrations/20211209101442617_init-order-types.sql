-- Up Migration
INSERT INTO "dealer"."order_types"
("order_type", "order_type_name")
VALUES
('market', 'market order'),
('limit', 'limit order'),
('post_only', 'Post-only order'),
('fok', 'Fill-or-kill order'),
('ioc', 'Immediate-or-cancel order'),
('optimal_limit_ioc','Market order with immediate-or-cancel order');

-- Down Migration
TRUNCATE TABLE "dealer"."order_types";
