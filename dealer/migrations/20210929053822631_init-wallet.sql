-- Up Migration
INSERT INTO dealer.wallet
(json_data)
VALUES
('[
    {
      "id": "dealer",
      "balance": {
        "currency": "USD",
        "amount": -100,
        "quantityInBtc": -0.00265463
      }
    }
  ]'::json
);

-- Down Migration
TRUNCATE TABLE dealer.wallet;
