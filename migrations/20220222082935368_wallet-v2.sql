-- Up Migration
DO $$
    DECLARE btcBalance FLOAT := 0;
    DECLARE usdBalance FLOAT := 0;
    DECLARE lastId INTEGER := 0;
    DECLARE result TEXT := '';
    BEGIN
        SELECT 
            (json_data -> 0 ->> 'balance')::json -> 'quantityInBtc' as btcBalance
        FROM dealer.wallet 
        WHERE json_data::json -> 0 ->> 'id' = 'dealer'
        INTO btcBalance;
        raise notice 'btcBalance = %', btcBalance;

        SELECT 
            (json_data -> 0 ->> 'balance')::json -> 'amount' as usdBalance
        FROM dealer.wallet 
        WHERE json_data::json -> 0 ->> 'id' = 'dealer'
        into usdBalance;
        raise notice 'usdBalance = %', usdBalance;


        INSERT INTO dealer.wallet
        (json_data)
        VALUES
        ('[
            {
                "id": "BTCWallet",
                "balance": 0,
                "walletCurrency": "BTC"
            },
            {
                "id": "USDWallet",
                "balance": 0,
                "walletCurrency": "USD"
            }
        ]'::json
        )
        RETURNING id
        INTO lastId;

        SELECT json_data::jsonb
        from dealer.wallet 
        WHERE id = lastId
        INTO result;
        raise notice 'new row: %', result;

        UPDATE dealer.wallet
        SET json_data = jsonb_set(json_data::jsonb, '{0,balance}', btcBalance::text::jsonb, false)
        WHERE id = lastId;

        SELECT json_data
        from dealer.wallet 
        WHERE id = lastId
        INTO result;
        raise notice 'new row: %', result;

        UPDATE dealer.wallet
        SET json_data = jsonb_set(json_data::jsonb, '{1,balance}', usdBalance::text::jsonb, false)
        WHERE id = lastId;

        SELECT json_data
        from dealer.wallet 
        WHERE id = lastId
        INTO result;
        raise notice 'new row: %', result;

        SELECT json_data
        from dealer.wallet 
        INTO result;
        raise notice 'before delete: %', result;

        DELETE 
        FROM dealer.wallet 
        WHERE json_data::json -> 0 ->> 'id' = 'dealer';

        SELECT json_data
        from dealer.wallet 
        INTO result;
        raise notice 'after delete: %', result;
END $$;

-- Down Migration
DO $$
    DECLARE btcBalance FLOAT := 0;
    DECLARE usdBalance FLOAT := 0;
    DECLARE lastId INTEGER := 0;
    DECLARE result TEXT := '';
    BEGIN
        SELECT 
            json_data -> 0 ->> 'balance' as btcBalance
        FROM dealer.wallet 
        WHERE json_data::json -> 0 ->> 'id' = 'BTCWallet'
        INTO btcBalance;
        raise notice 'btcBalance = %', btcBalance;

        SELECT 
            json_data -> 1 ->> 'balance' as usdBalance
        FROM dealer.wallet 
        WHERE json_data::json -> 1 ->> 'id' = 'USDWallet'
        into usdBalance;
        raise notice 'usdBalance = %', usdBalance;


        INSERT INTO dealer.wallet
        (json_data)
        VALUES
        ('[
            {
                "id": "dealer",
                "balance": {
                    "currency": "USD",
                    "amount": 0,
                    "quantityInBtc": 0
                }
            }
        ]'::json
        )
        RETURNING id
        INTO lastId;

        SELECT json_data::jsonb
        from dealer.wallet 
        WHERE id = lastId
        INTO result;
        raise notice 'new row: %', result;

        UPDATE dealer.wallet
        SET json_data = jsonb_set(json_data::jsonb, '{0,balance,quantityInBtc}', btcBalance::text::jsonb, false)
        WHERE id = lastId;

        SELECT json_data
        from dealer.wallet 
        WHERE id = lastId
        INTO result;
        raise notice 'new row: %', result;

        UPDATE dealer.wallet
        SET json_data = jsonb_set(json_data::jsonb, '{0,balance,amount}', usdBalance::text::jsonb, false)
        WHERE id = lastId;

        SELECT json_data
        from dealer.wallet 
        WHERE id = lastId
        INTO result;
        raise notice 'new row: %', result;

        SELECT json_data
        from dealer.wallet 
        INTO result;
        raise notice 'before delete: %', result;

        DELETE 
        FROM dealer.wallet 
        WHERE json_data::json -> 0 ->> 'id' = 'BTCWallet';

        SELECT json_data
        from dealer.wallet 
        INTO result;
        raise notice 'after delete: %', result;
END $$;

