-- Up Migration
CREATE TABLE "dealer"."internal_transfers" (
  "id" serial PRIMARY KEY,
  "currency" varchar(4) NOT NULL,
  "quantity" decimal NOT NULL,
  "from_account_id" integer,
  "to_account_id" integer,
  "instrument_id" varchar(64) NOT NULL,
  "transfer_id" varchar(64) NULL,
  "success" boolean NOT NULL,
  "updated_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL,
  "created_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL,
	
  CONSTRAINT fk_from_account_id FOREIGN KEY(from_account_id)   REFERENCES dealer.exchange_account_types(id),
  CONSTRAINT fk_to_account_id FOREIGN KEY(to_account_id)   REFERENCES dealer.exchange_account_types(id)
);

-- Down Migration
DROP TABLE IF EXISTS "dealer"."internal_transfers" CASCADE;
