-- Up Migration
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

        SELECT id
        FROM dealer.wallet 
        ORDER BY id DESC
        LIMIT 1
        into lastId;

        SELECT json_data
        from dealer.wallet 
        WHERE id = lastId
        INTO result;
        raise notice 'original row: %', result;

        UPDATE dealer.wallet
        SET json_data = jsonb_set(json_data::jsonb, '{0,balance}', (ABS(btcBalance) * 100000000)::text::jsonb, false)
        WHERE id = lastId;

        SELECT json_data
        from dealer.wallet 
        WHERE id = lastId
        INTO result;
        raise notice 'new row: %', result;

        UPDATE dealer.wallet
        SET json_data = jsonb_set(json_data::jsonb, '{1,balance}', (-ABS(usdBalance) * 100)::text::jsonb, false)
        WHERE id = lastId;

        SELECT json_data
        from dealer.wallet 
        WHERE id = lastId
        INTO result;
        raise notice 'new row: %', result;
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

        SELECT id
        FROM dealer.wallet 
        ORDER BY id DESC
        LIMIT 1
        into lastId;

        SELECT json_data
        from dealer.wallet 
        WHERE id = lastId
        INTO result;
        raise notice 'original row: %', result;

        UPDATE dealer.wallet
        SET json_data = jsonb_set(json_data::jsonb, '{0,balance}', (ABS(btcBalance) / 100000000)::text::jsonb, false)
        WHERE id = lastId;

        SELECT json_data
        from dealer.wallet 
        WHERE id = lastId
        INTO result;
        raise notice 'new row: %', result;

        UPDATE dealer.wallet
        SET json_data = jsonb_set(json_data::jsonb, '{1,balance}', (-ABS(usdBalance) / 100)::text::jsonb, false)
        WHERE id = lastId;

        SELECT json_data
        from dealer.wallet 
        WHERE id = lastId
        INTO result;
        raise notice 'new row: %', result;
END $$;
