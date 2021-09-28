select * 
from dealer.in_flight 
where address = ${address}
order by updated_timestamp desc
limit 1
