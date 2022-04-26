-- Up Migration
CREATE TABLE "dealer"."exchanges" (
  "id" serial PRIMARY KEY,
  "exchange_name" varchar(64) NOT NULL UNIQUE,
  "updated_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL,
  "created_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL
);

-- Down Migration
DROP TABLE IF EXISTS "dealer"."exchanges" CASCADE;
