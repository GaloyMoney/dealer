# Dealer

## What Is a Dealer?

Dealers are people or firms who buy and sell securities **for their own account**. A dealer acts as a principal in trading for its own account, as opposed to a broker who acts as an agent who executes orders on behalf of its clients. 

Further reading: [Dealer](https://www.investopedia.com/terms/d/dealer.asp), [Broker-Dealer](https://www.investopedia.com/terms/b/broker-dealer.asp).

## Why a Dealer?

Galoy is a bitcoin bank and therefore holds bitcoin natively. But as many users still prefer holding their local currency, ex. USD, either partially or entirely, there's a need to transform the bitcoin into USD regardless of the bitcoin price in USD over time. This is the responsibility of the Dealer and called Hedging.

## What Is a Hedge?

A hedge is an investment that is made with the intention of reducing the risk of adverse [USD] price movements in an [bitcoin] asset. Normally, a hedge consists of taking an opposite position in a related security. 

Further reading: [Hedge](https://www.investopedia.com/terms/h/hedge.asp)

Ex: forward contracts, futures contracts and other derivatives. 

## How to hedge bitcoin

One of the simplest strategy to hedge a certain amount of bitcoin in USD is to promise to sell at a future date a specific quantity of USD for a specific amount of bitcoins all determined today, i.e. short (be the seller) an inverse bitcoin futures contract.

Ex. A user received 1 bitcoin. The price of bitcoin is 10,000.00 USD. 
The user elects to keep the USD amount stable, for 1 month, regardless of the price of bitcoin in USD.
The user immediately enters an agreement with a 3rd party to pay 1 bitcoin in 1 month in exchange for 10,000.00 USD.
(The price of 1 bitcoin on the agreement would likely be different than the current price of bitcoin, but it would be related so keeping numbers simple for now.)

After a month the user exchanges the bitcoin and receives 10,000.00 USD, regardless of the price of bitcoin, as that was the agreement. 
We assume no counter-party risk (both parties in the contract see it thru and do not change their mind, runaway, go bankrupt, etc.)
But if the price of bitcoin is 11,000.00 USD, our user lost the opportunity to make a 1,000.00 USD gain.
If the price of bitcoin is 9,000.00 USD, our user avoided the 1,000.00 USD loss.

- Note that in this example, the contract would be called a Forward and is subject to counter-party risk, can be defined for any amount and expiry. Versus a Futures contract which is a price, expiry standardized and party risk safeguarded version of a Forward contract.

Further reading: [Forward Contract](https://www.investopedia.com/terms/f/forwardcontract.asp)


###  What Is a Futures Contract?

A futures contract is a legal agreement to buy or sell a particular [bitcoin] commodity asset at a predetermined [USD] price at a specified time in the future. 

The buyer of a futures contract is taking on the obligation to buy and receive the underlying asset when the futures contract expires. The seller of the futures contract is taking on the obligation to provide and deliver the underlying asset at the expiration date. 

Further reading: [Futures Contract](https://www.investopedia.com/terms/f/futurescontract.asp)

Ex. 1: A 1 bitcoin contract to be settled in USD at expiry.
Ex. 1.1: Buying 1 contract of the above, when it is worth 10,000 USD, would yield 1,000.00 USD profit if the contract is worth 11,000.00 USD at expiry.
Ex. 1.2: Buying 1 contract of the above, when it is worth 10,000 USD, would yield 1,000.00 USD loss if the contract is worth 9,000.00 USD at expiry.

###  What Is an Inverse Futures Contract?

A futures contract where the commodity asset has been swapped with the settlement currency.
In opposition to the standard futures definition above: a legal agreement to buy or sell a particular [USD] "commodity asset" at a predetermined [bitcoin] price at a specified time in the future. 

Further reading: [Inverse Bitcoin Futures Contract](https://futuresbit.com/what-is-inverse-bitcoin-futures-contract/)

Ex. 1: A 10,000.00 USD contract to be settled in bitcoin at expiry.
Ex. 1.1: Buying 1 contract of the above, when it is worth 1 bitcoin, would yield 0.1 bitcoin profit if the contract is worth 1.1 bitcoin at expiry.
- Note that in this case the price of one bitcoin in USD has declined to 9,090.91 USD, resulting in more bitcoins for the same original 10,000.00 USD value of the contract.
Ex. 1.2: Buying 1 contract of the above, when it is worth 1 bitcoin, would yield 0.1 bitcoin loss if the contract is worth 0.9 bitcoin at expiry.
- Note that in this case the price of one bitcoin in USD has increased to 11,111.11 USD, resulting in less bitcoins for the same original 10,000.00 USD value of the contract.


###  What Is a Perpetual Futures Contract?

A perpetual futures contract, also known as a perpetual swap, is an agreement to non-optionally buy or sell an asset at an unspecified point in the future. Perpetual futures are cash-settled, and differ from regular futures in that they lack a pre-specified delivery date, and can thus be held indefinitely without the need to roll over contracts as they approach expiration. Payments are periodically exchanged between holders of the two sides of the contracts, long and short, with the direction and magnitude of the settlement based on the difference between the contract price and that of the underlying asset, as well as, if applicable, the difference in leverage between the two sides. 

Further reading: [Perpetual Futures Contract](https://en.wikipedia.org/wiki/Perpetual_futures)


## How does the Dealer hedge?

The Dealer currently implements one of the simplest hedging strategy, the one previously explained in "How to hedge bitcoin". 
It uses a perpetual inverse bitcoin futures contract which it sells/short to the amount of the current USD liability (rounded to an integral number of contracts, ex. 175.00 USD liability @ 100.00 USD per contract => 200.00 USD sold/shorted or 2 contracts.)

The justification for the perpetual contract are:
- The contract has no expiry which simplifies the selection from multiple possible expiries and removes the need for rolling over
- The contract is settled in bitcoin which "perfectly" hedges the USD liability
- The current contract has a face value of 100.00 USD per contract allowing for closely tracking the USD liability changes
- The contract is sort of "[marked to market](https://www.investopedia.com/terms/m/marktomarket.asp)" via the funding fees, every 8h, i.e. settlement of the basis (difference between the contract price and the spot price) between the long and short side of the contract is exchanged. No fees by the exchange are taken. The change in price of the contract itself is not settled until the sold contract is bought back or a process of unrealized profit-and-lost settlement exists.

The justification against the other financial instruments are:
- Forward contracts would not allow for the dynamic nature of the USD liability changing with user interaction
- Forward contracts would represent a counter-party risk
- Standard futures contracts would settle in USD instead of bitcoin and would require more frequent adjustment of the position to track the bitcoin price like an inverse
- Standard futures contracts have expiry that won't match the duration of the USD liability forcing appropriate expiry selection, eventual roll over, etc. of the contract
- Inverse futures contracts only have expiry mismatch to USD liability duration

This strategy avoids expiry and standard USD settled management of non-perpetuals non-inverse contracts.
Note that given the Dealer's duty, if the USD liability it tries to hedge is non-zero, it always trade a cash-and-carry / long basis strategy.

### What Does Basis Mean?

In the futures market, basis represents the difference between the cash price of the commodity and the futures price of that commodity.

Further reading: [Basis](https://www.investopedia.com/terms/b/basis.asp)

### What Is a Cash-and-Carry Trade?

A cash-and-carry trade is an arbitrage strategy that exploits the mispricing between the underlying asset and its corresponding derivative. The key to profiting from this strategy is the eventual correction in that mispricing. This strategy is commonly known as basis trading.

Further reading: [Cash-and-Carry Trade](https://www.investopedia.com/terms/c/cashandcarry.asp)

### What is Basis Trading?

In the context of futures trading, the term basis trading refers generally to those trading strategies built around the difference between the spot price of a commodity and the price of a futures contract for that same commodity. This difference, in futures trading, is referred to as the basis.

Further reading: [Basis Trading](https://www.investopedia.com/terms/b/basis-trading.asp)

### What Is Long the Basis?

Long the basis is a trading strategy in which an investor who owns or has bought a commodity hedges their investment, or gives themselves a little buffer against potential market fluctuations, by selling futures contracts on that commodity. Taking such action provides a guaranteed price at which they may sell their commodities if the market price moves against their underlying position. 

Further reading: [Long the Basis](https://www.investopedia.com/terms/l/long_on_the_basis.asp)

## The big picture

Users of the bitcoin bank elect to keep a % of their account in stable USD value. The aggregate of all those sum up to a total **USD liability** for the bank. 

The Dealer tracks and hedges the bank's USD liability by trading in the bitcoin derivatives market for example (different strategies are possible here).

As the USD liability changes, the Dealer updates it's position to keep the balance.

As the price of bitcoin in USD changes, the Dealer updates it's position to keep the balance.

As the liquidity of the Dealer on the derivatives market changes due to the above two variations, the Dealer redraws funds to keep counter-party risk low or deposits more funds to keep/open larger positions.

# Current Implementation

This repo currently implements a single USD hedging strategy based on the perpetual bitcoin inverse futures available on the [OKEx](https://www.okex.com/) exchange.
It uses [CCXT](https://github.com/ccxt/ccxt) to abstract the REST API exchange connection, making it possible to port the same strategy to a different exchange using a similar contract.
Given the request-response nature of the REST API, the Dealer is explicitly executed in a periodic fashion to update its position based on the changed conditions. 
There are no requirements for high frequency execution and the re-hedging period is linked to the rate of change in USD liability.

Eventual development could lead to other strategies and contracts being used with optionally a decision layer enabling multi concurrent strategies to be employed.
The topic of trading funds management has been left out and is specific to the exchange and contract used, 
but a simple bitcoin margin held between:
- 1.2x (withdraw excess if below to mitigate counter-party risk) and 
- 3x (deposit to keep 2x on average and avoid liquidation)
are the current fund transfer rules.

