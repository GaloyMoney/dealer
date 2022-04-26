-- Up Migration
CREATE TABLE "dealer"."funding_rates" (
  "id" serial PRIMARY KEY,

  "timestamp" timestamptz NOT NULL,
  "funding_time" bigint NOT NULL,
  "instrument_id" varchar(64) NOT NULL,
  "exchange_id" integer NOT NULL,

  "funding_rate" DECIMAL NOT NULL,

  "updated_timestamp" timestamptz DEFAULT current_timestamp NOT NULL,
  "created_timestamp" timestamptz DEFAULT current_timestamp NOT NULL,

  CONSTRAINT fk_exchange_id FOREIGN KEY(exchange_id)   REFERENCES dealer.exchanges(id)

);
CREATE INDEX "funding_rates_time_instrument_exchange_idx" ON "dealer"."funding_rates" ("funding_time", "instrument_id", "exchange_id");

-- Down Migration
DROP INDEX "dealer"."funding_rates_time_instrument_exchange_idx";
DROP TABLE IF EXISTS "dealer"."funding_rates" CASCADE;
    