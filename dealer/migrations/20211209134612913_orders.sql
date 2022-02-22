-- Up Migration
CREATE TABLE "dealer"."orders" (
  "id" serial PRIMARY KEY,
  "instrument_id" varchar(64) NOT NULL,
  "order_type_id" int NOT NULL,
  "side" varchar(4) NOT NULL CHECK ("side" in ('buy', 'sell')),
  "quantity" decimal NOT NULL,
  "trade_mode" varchar(8) NOT NULL CHECK ("trade_mode" in ('cross', 'isolated')),
  "position_side" varchar(5) NOT NULL CHECK ("position_side" in ('net', 'long', 'short')),
  "status_code" varchar(64) NULL,
  "status_message" varchar(64) NULL,
  "order_id" varchar(64) NULL,
  "client_order_id" varchar(64) NULL,
  "success" boolean NOT NULL,
  "updated_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL,
  "created_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL,
	
  CONSTRAINT fk_order_type_id FOREIGN KEY(order_type_id)   REFERENCES dealer.order_types(id)
);

-- Down Migration
DROP TABLE IF EXISTS "dealer"."orders" CASCADE;
