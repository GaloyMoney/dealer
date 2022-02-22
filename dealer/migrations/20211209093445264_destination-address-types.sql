-- Up Migration
CREATE TABLE "dealer"."destination_address_types" (
  "id" serial PRIMARY KEY,
  "destination_address_type_name" varchar(64) NOT NULL UNIQUE,
  "updated_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL,
  "created_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL
);

-- Down Migration
DROP TABLE IF EXISTS "dealer"."destination_address_types" CASCADE;
