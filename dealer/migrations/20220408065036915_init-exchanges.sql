-- Up Migration
INSERT INTO "dealer"."exchanges"
("exchange_name")
VALUES
( 'bitmex' ),
( 'okex' ),
( 'deribit' ),
( 'kraken' ),
( 'ftx' ),
( 'bitfinex' ),
( 'binance' ),
( 'bybit' ),
( 'huobi' );

-- Down Migration
TRUNCATE TABLE "dealer"."exchanges";
