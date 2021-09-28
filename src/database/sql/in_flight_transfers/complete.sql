begin
    update dealer.in_flight 
    set is_completed = true
    where address = ${address}
    returning *
end
