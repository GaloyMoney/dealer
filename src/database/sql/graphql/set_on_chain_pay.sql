INSERT INTO dealer.on_chain_pay
(json_data) 
VALUES 
(${jsonData})
RETURNING *
