# Price Service
## Overview
A system aware service to provide the bid and ask for balance exchange between BTC and local currency.

It allows for adjusting the exchange rate depending on the conditions of the system.

It provides price quotes for immediate transactions as well as option like locked-in exchange rate for settlement upon reception of the funds at a later time.

## Interface

### Immediate USD Buy
```
GetCentsFromSatsForImmediateBuy(amount: Satoshis): USD
```

This interface takes an amount of BTC in sats and returns the equivalent amount of USD using an internal exchange rate.

#### Internal Exchange Rate
Since the balances are only records in the ledger, and that the USD is ultimately hedged by the Dealer, which in turn uses a market exchange (OKEx) to do so,
it make sense to use at the maximum the **bid** from the exchange directly, apply the transaction fee (ex.: 0.05%) and then some discretionary fees.




### Immediate USD Sell (BTC Buy)
```
GetSatsFromCentsForImmediateSell(amount: USD): Satoshis
```

This interface takes an amount of USD in cents and returns the equivalent amount of BTC in sats using an internal exchange rate.

#### Internal Exchange Rate
For the same reasons as explained [above](./PRICE-SERVICE.md#Immediate-USD-Buy),
it make sense to use at the maximum the **bid** from the exchange directly, apply the transaction fee (ex.: 0.05%) and then some discretionary fees.



### Future USD Buy
```
GetCentsFromSatsForFutureBuy(amount: Satoshis, time-to-maturity: Seconds): USD
```

This interface takes an amount of BTC in sats and returns the equivalent amount of USD using an internal exchange rate.

#### Internal Exchange Rate
For the same reasons as explained [above](./PRICE-SERVICE.md#Immediate-USD-Buy),
and the fact that the rate is agreed upon now for a future settlement, there's an extra component added, namely and optionality spread.

##### Optionality Spread
An invoice that fixes the exchange rate now for reception of the agreed upon funds at a later time, presents an opportunity for abuse.

Ex. 
- Create an invoice for max time-to-maturity
- watch the market
    - if profitable exercise the invoice and liquidate
    - if not let it expire
- Repeat

This type of invoice is indirectly a Call Option i.e.: a contract that gives the right, but not the obligation, to buy an asset (USD) at a specified price (BTC) within a specific time period.

So such a contract has a financial value that in this case is given for free and therefore can be exploited.

To counterbalance that, one can determine the expected return of the option at the time of creation given the market conditions 
and modify it so the expected return is zero, i.e. skew the exchange rate in disfavor of the buyer to nullify the arbitrage opportunity.
In doing so it becomes a zero sum game instead of slightly positive for the buyer.

##### Example
###### Parameter used for the Option
|Parameter|Value|
|---------|:---:|
|Spot Price|50,000 USD|
|Strike Price|50,000 USD|
|Price volatility|50%|
|Risk-free interest rate|1%|
|Time to maturity (in years)|5 minutes|

|Option Value|
|-----|
|0.00 USD|


###### Distribution of returns

###### Volatility Parameter


### Future USD Sell (BTC Buy)
```
GetExchangeRateForFutureUsdSell(amount: USD, time-to-maturity: Seconds): Satoshis
```

This interface takes an amount of USD and returns the equivalent amount of BTC in sats using an internal exchange rate.

#### Internal Exchange Rate
Same as [above](./PRICE-SERVICE.md#Future-USD-Buy), but using the **ask** as ceiling.
