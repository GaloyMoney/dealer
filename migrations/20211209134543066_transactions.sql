-- Up Migration
CREATE TABLE "dealer"."transactions" (
  "id" serial PRIMARY KEY,

  "timestamp" varchar(256) DEFAULT current_timestamp NOT NULL,
  "bill_id" varchar(64) NOT NULL,
  "bill_type_id" integer NOT NULL,
  "bill_subtype_id" integer NOT NULL,
  "currency" varchar(4) NOT NULL,
  "balance" decimal NOT NULL,
  "balance_change" decimal NOT NULL,
  "fee" decimal NULL,
  "position_balance" decimal NULL,
  "position_balance_change" decimal NULL,
  "quantity" decimal NULL,
  "pnl" decimal NULL,
  "from_account_id" integer,
  "to_account_id" integer,
  "instrument_type" varchar(8) NULL CHECK ("instrument_type" in ('SPOT ', 'MARGIN', 'SWAP', 'FUTURES', 'OPTION')),
  "margin_mode" varchar(8) NULL CHECK ("margin_mode" in ('cross', 'isolated')),
  "execution_type" varchar(8) NULL CHECK ("execution_type" in ('T', 'M')),
  "instrument_id" varchar(64) NULL,
  "order_id" varchar(64) NULL,
  "notes" varchar(64) NULL,

  "updated_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL,
  "created_timestamp" varchar(256) DEFAULT current_timestamp NOT NULL,
	
  CONSTRAINT fk_bill_type_id FOREIGN KEY(bill_type_id)   REFERENCES dealer.bill_types(id),
  CONSTRAINT fk_bill_subtype_id FOREIGN KEY(bill_subtype_id)   REFERENCES dealer.bill_subtypes(id),
  CONSTRAINT fk_from_account_id FOREIGN KEY(from_account_id)   REFERENCES dealer.exchange_account_types(id),
  CONSTRAINT fk_to_account_id FOREIGN KEY(to_account_id)   REFERENCES dealer.exchange_account_types(id)
);

-- Down Migration
DROP TABLE IF EXISTS "dealer"."transactions" CASCADE;





insert into "dealer"."transactions" (
  "balance",
  "balance_change",
  "bill_id",
  "currency",
  "execution_type",
  "fee",
  "from_account_id",
  "instrument_id",
  "instrument_type",
  "margin_mode",
  "notes",
  "order_id",
  "pnl",
  "position_balance",
  "position_balance_change",
  "bill_subtype_id",
  "quantity",
  "to_account_id",
  "timestamp",
  "bill_type_id"
) 
values 
(
  0.0033232536961702,
  0.0000022953358961,
  '388721434452963335',
  'BTC',
  null,
  0,
  null,
  'BTC-USD-SWAP',
  'SWAP',
  'cross',
  null,
  null,
  0.0000022953358961,
  0,
  0,
  174,
  3,
  null,
  to_timestamp(1638950412068),
  8
)
