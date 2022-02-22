-- Up Migration
INSERT INTO dealer.wallet
(json_data)
VALUES
('[
    {
      "id": "dealer",
      "balance": {
        "currency": "USD",
        "amount": -100
      }
    }
  ]'::json
);

-- Down Migration
TRUNCATE TABLE dealer.wallet;
