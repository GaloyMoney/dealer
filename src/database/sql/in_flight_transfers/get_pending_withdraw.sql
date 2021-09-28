select * 
from dealer.in_flight 
where is_deposit_on_exchang = false
and is_completed = false
order by updated_timestamp desc
