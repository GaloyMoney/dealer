-- Up Migration
CREATE TABLE "dealer"."order_types" (
  "id" serial PRIMARY KEY,
  "order_type" varchar(64) NOT NULL UNIQUE,
  "order_type_name" varchar(64) NOT NULL,
  "updated_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL,
  "created_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL
);

-- Down Migration
DROP TABLE IF EXISTS "dealer"."order_types" CASCADE;
