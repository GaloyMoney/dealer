-- Up Migration
INSERT INTO dealer.last_on_chain_address
(json_data)
VALUES
('{"id": "bc1qmyhq2rm8edqv076dj89r5utskt3394m7xu3pge"}'::json);

-- Down Migration
TRUNCATE TABLE dealer.last_on_chain_address;
