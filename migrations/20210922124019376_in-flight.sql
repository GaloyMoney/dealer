-- Up Migration
CREATE TABLE "in_flight" (
  "id" serial PRIMARY KEY,
  "is_deposit_on_exchange" boolean NOT NULL,
  "address" varchar(64) NOT NULL,
  "transfer_size_in_sats" bigint NOT NULL,
  "memo" varchar(256),
  "is_completed" boolean NOT NULL,
  "updated_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL,
  "created_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL
);
COMMENT ON COLUMN "in_flight"."is_deposit_on_exchange" IS $pga$true: deposit on exchange | false: withdrawal from exchange$pga$;
CREATE INDEX "in_flight_is_depo_addr_trans_idx" ON "in_flight" ("is_deposit_on_exchange", "address", "transfer_size_in_sats", "is_completed");

-- Down Migration
DROP INDEX "in_flight_is_depo_addr_trans_idx";
DROP TABLE IF EXISTS "in_flight" CASCADE;
