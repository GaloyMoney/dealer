-- Up Migration
CREATE TABLE "dealer"."bill_subtypes" (
  "id" serial PRIMARY KEY,
  "bill_subtype" varchar(64) NOT NULL UNIQUE,
  "updated_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL,
  "created_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL
);

-- Down Migration
DROP TABLE IF EXISTS "dealer"."bill_subtypes" CASCADE;
