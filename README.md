# Dealer

## What Is a Dealer?

Dealers are people or firms who buy and sell securities **for their own account**. A dealer acts as a principal in trading for its own account, as opposed to a broker who acts as an agent who executes orders on behalf of its clients. 

## Why a Dealer?

Galoy is a bitcoin bank and therefore holds bitcoin natively. But as most users still prefer holding their local currency, ex. USD, either partially or entirely, there's a need to transform the bitcoin liabilities into USD liabilities regardless of the bitcoin price in USD over time. This is the responsibility of the Dealer and called Hedging.

## What Is a Hedge?

A hedge is an investment that is made with the intention of reducing the risk of adverse [USD] price movements in an [bitcoin] asset. Normally, a hedge consists of taking an opposite position in a related security.
Ex: forward contracts, futures contracts and other derivatives. 

## How to hedge bitcoin

One of the simplest strategy to hedge a certain amount of bitcoin in USD is to promise to sell at a future date a specific quantity of USD for a specific amount of bitcoins all determined today, i.e. short (be the seller) an inverse bitcoin futures contract.

Ex. A user received 1 bitcoin. The price of bitcoin is 10,000.00 USD. 
The user elects to keep the USD amount stable, for 1 month, regardless of the price of bitcoin in USD.
The user immediatly enters an agreement with a 3rd party to pay 1 bitcoin in 1 month in exchange for 10,000.00 USD.
(The price of 1 bitcoin on the agreement would likely be different than the current price of bitcoin, but it would be related so keeping numbers simple for now.)

After a month the user exchanges the bitcoin and receives 10,000.00 USD, regardless of the price of bitcoin, as that was the agreement. 
We assume no 3rd party risk (both party in the contract see it thru and do not change their mind, runaway, go bankrupt, etc.)
But if the price of bitcoin is 11,000.00 USD, our user lost the opportunity to make a 1,000.00 USD gain.
If the price of bitcoin is 9,000.00 USD, our user avoided the 1,000.00 USD loss.

- Note that in this example, the contract would be called a Forward and is subject to 3rd party risk, can be defined for any amount and expiry. Versus a Futures contract which is a price, expiry standardized and party risk safeguarded version of a Forward contract.



###  What Is a Futures Contract?

A futures contract is a legal agreement to buy or sell a particular [bitcoin] commodity asset at a predetermined [USD] price at a specified time in the future. 

The buyer of a futures contract is taking on the obligation to buy and receive the underlying asset when the futures contract expires. The seller of the futures contract is taking on the obligation to provide and deliver the underlying asset at the expiration date.  

Ex.: A 1 bitcoin contract to be settled in USD at expiry.
Ex. 1: Buying 1 contract of the above, when it is worth 10,000 USD, would yield 1,000.00 USD profit if the contract is worth 11,000.00 USD at expiry.
Ex. 2: Buying 1 contract of the above, when it is worth 10,000 USD, would yield 1,000.00 USD loss if the contract is worth 9,000.00 USD at expiry.

###  What Is an Inverse Futures Contract?

A futures contract where the commodity asset has been swapped with the settlement currency.
In opposition to the standard futures definition above: a legal agreement to buy or sell a particular [USD] "commodity asset" at a predetermined [bitcoin] price at a specified time in the future. 

Ex.: A 10,000.00 USD contract to be settled in bitcoin at expiry.
Ex. 1: Buying 1 contract of the above, when it is worth 1 bitcoin, would yield 0.1 bitcoin profit if the contract is worth 1.1 bitcoin at expiry.
- Note that in this case the price of one bitcoin in USD has declined to 9,090.91 USD, resulting in more bitcoins for the same original 10,000.00 USD value of the contract.
Ex. 2: Buying 1 contract of the above, when it is worth 1 bitcoin, would yield 0.1 bitcoin loss if the contract is worth 0.9 bitcoin at expiry.
- Note that in this case the price of one bitcoin in USD has increased to 11,111.11 USD, resulting in less bitcoins for the same original 10,000.00 USD value of the contract.


## How does the Dealer hedges?

One of the simplest strategy to hedge a certain amount of bitcoin in USD is to promise to sell bitcoin for USD at a future date, i.e. sell an inverse bitcoin futures contract.


## The big picture

Users of the bitcoin bank elect to keep a % of their account in stable USD value. The aggregate of all those sum up to a total **USD liability** for the bank. 

The Dealer tracks and hedges the bank's USD liability by trading in the bitcoin derivatives market for example (different strategies are possible here).

As the USD liability changes, the Dealer updates it's position to keep the balance.

As the price of bitcoin in USD changes, the Dealer updates it's position to keep the balance.

As the liquidity of the Dealer on the derivatives market changes due to the above two variations, the Dealer redraws funds to keep counterparty risk low or deposits more funds to keep/open larger positions.

## Strategies

### Perpetual Futures



### Weekly/Monthly Futures

### Savings account / Money Market
