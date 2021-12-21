-- Up Migration
CREATE TABLE "dealer"."external_transfers" (
  "id" serial PRIMARY KEY,
  "is_deposit_not_withdrawal" boolean NOT NULL,
  "currency" varchar(4) NOT NULL,
  "quantity" decimal NOT NULL,
  "destination_address_type_id" integer NOT NULL,
  "to_address" varchar(64) NOT NULL,
  "fund_password_md5" varchar(64) NOT NULL,
  "fee" decimal NOT NULL,
  "chain" varchar(64) DEFAULT 'Internal' NOT NULL,
  "transfer_id" varchar(64) NULL,
  "success" boolean NOT NULL,
  "updated_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL,
  "created_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL,
	
  CONSTRAINT fk_destination_address_type_id FOREIGN KEY(destination_address_type_id)   REFERENCES dealer.destination_address_types(id)
);

-- Down Migration
DROP TABLE IF EXISTS "dealer"."external_transfers" CASCADE;
