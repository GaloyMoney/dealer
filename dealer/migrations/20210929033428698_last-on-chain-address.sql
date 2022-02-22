-- Up Migration
CREATE TABLE "last_on_chain_address" (
  "id" serial PRIMARY KEY,
  "json_data" json NOT NULL,
  "updated_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL,
  "created_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL
);

-- Down Migration
DROP TABLE IF EXISTS "last_on_chain_address" CASCADE;
