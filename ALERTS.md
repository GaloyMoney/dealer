# Dealer Alerts

## 🚩Dealer is unable to get funds on / off the exchange alert

### Conditions
    in-flight fund (BTC) transfer >0, for >3h (6x 10min = 1h expected on-chain on average)

### Description
- A fund (BTC) transfer has been initiated by the Dealer to either fund a future transaction on the exchange (deposit) or to recover excess collateral (withdrawal)
- The transfer is still pending, after >3h, so apparently not resolve/completed and it's state is uncertain
- Given that the Dealer only currently uses on-chain transactions, it's possible that blocks were very slow and the exchange hasn't released the funds yet which would resolve the transfer
- So the goal of the diagnostic is to figure out the transaction in question using Galoy API via Postman (or other preferred method), it's hash and look if it should have been confirmed already at the exchange and therefore release
    - Do we have on-chain transactions for the active strategy ("OkexPerpetualSwapStrategy")?
    - Are any of those transactions pending?
    - If there are, what does the transaction hash reveal about the number of confirmations on-chain?

### Checks for on-support
#### References
- [Galoy Postman Collection](https://github.com/GaloyMoney/galoy/tree/main/src/graphql/docs)
- [Galoy GraphQL API Reference](https://galoymoney.github.io/galoy/)
- [Galoy GraphQL User Login Endpooint](https://galoymoney.github.io/galoy/#mutation-userLogin) (available in [Galoy Postman Collection](https://github.com/GaloyMoney/galoy/tree/main/src/graphql/docs))
- [Galoy GraphQL Main Query Endpooint](https://galoymoney.github.io/galoy/#query-me) (available in [Galoy Postman Collection](https://github.com/GaloyMoney/galoy/tree/main/src/graphql/docs))
		
#### Galoy GraphQL API URLs
- https://localhost:4002/graphql
- https://api.staging.galoy.io/graphql
- https://api.freecorn.galoy.io/graphql
- https://api.mainnet.galoy.io/graphql
		
#### Diagnostic

1. Postman step 1 (with Dealer creds from GCP/etc): 
    - GraphQL Query:
        ```
            mutation userLogin ($input: UserLoginInput!) {
                userLogin (input: $input) {
                    errors {
                        message
                        path
                    }
                    authToken
                }
            }
        ```

    - GraphQL Variables:
        ```
            {
                "input": {
                "phone": "{{phone}}",
                "code": "{{code}}"
                }
            }
        ```

1. Postman step 2 (with authToken from userLogin in step 1): 
    - GraphQL Query:
        ```
            query me($recentTransactions: Int) {
                me {
                createdAt
                id
                language
                phone
                twoFAEnabled
                username
                defaultAccount {
                    id
                    defaultWalletId
                    wallets {
                    __typename
                    id
                    balance
                    walletCurrency
                    transactions(last: $recentTransactions) {
                        pageInfo {
                        hasNextPage
                        hasPreviousPage
                        startCursor
                        endCursor
                        }
                        edges {
                        cursor
                        node {
                            id
                            status
                            direction
                            memo
                            createdAt

                            settlementAmount
                            settlementFee
                            settlementPrice {
                            base
                            offset
                            currencyUnit
                            formattedAmount
                            }

                            initiationVia {
                            __typename
                            ... on InitiationViaIntraLedger {
                                counterPartyWalletId
                                counterPartyUsername
                            }
                            ... on InitiationViaLn {
                                paymentHash
                            }
                            ... on InitiationViaOnChain {
                                address
                            }
                            }
                            settlementVia {
                            __typename
                            ... on SettlementViaIntraLedger {
                                counterPartyWalletId
                                counterPartyUsername
                            }
                            ... on SettlementViaLn {
                                paymentSecret
                            }
                            ... on SettlementViaOnChain {
                                transactionHash
                            }
                            }
                        }
                        }
                    }
                    }
                }
                }
            }
        ```
    - GraphQL Variables:
        ```
            {
                "recentTransactions": 10000
            }
        ```
1. Look for completion of deposits / withdrawals:
    - "memo": "deposit of \<some amount\> btc to OkexPerpetualSwapStrategy",
    - "memo": "withdrawal of \<some amount\> btc from OkexPerpetualSwapStrategy",
    - "status" === "PENDING"?
    - "settlementVia.__typename" === "SettlementViaOnChain"
    - "transactionHash" on btc explorer
    - etc.
			
## 🚩Dealer is unable to get liability in USD from Galoy Wallet alert
### Conditions
    liabilityInUsd is not a number (NaN/null/undefined)

### Description
    - The liability in usd figure, coming from the Dealer's Wallet on Galoy is either not a valid number or not received
    - So the goal of the diagnostic is to figure out if the Dealer's USD Wallet is invalid, the endpoint down or else
        - Is the endpoint reachable
        - Is the USD Wallet typename as expected
        - Is the USD Wallet balance a negative number as expected
        - Is the USD Wallet currency as expected

### Checks for on-support

#### Diagnostic

1. Proceed as [above](./ALERTS.md#Dealer-is-unable-to-get-funds-on--off-the-exchange-alert) without transactions data:
    - GraphQL Variables:
        ```
            {
                "recentTransactions": 0
            }
        ```
1. Look for UsdWallet and it's balance if call succeed:
    - "__typename": "UsdWallet" ?
    - "balance" negative number ?
    - "walletCurrency": "USD" ?

## 🚩Dealer is unable to close position warning ⚠
### Conditions
    liabilityInUsd == 0 && exposure >0, for >3h (6x 10min = 1h expected on-chain on average)

### Description
    - The liability in usd figure has been zero for >3h, yet the exposure (liability hedged on the exchange) is positive
    - So the goal of the diagnostic is to figure out why the Dealer is or seems unable to close down the position and zero the exposure
        - Is the exchange down?
        - Are there authentication/other errors on orders sent from the Dealer to the exchange?
        - Are there any orders being initiated by the Dealer to close down the position?

### Checks for on-support
#### Diagnostic
- [OKX System Status](https://www.okx.com/api/v5/system/status)
- [OKX System Status Ongoing?](https://www.okx.com/api/v5/system/status?state=ongoing)
- [OKX Real-time System Maintenance Info](https://www.okx.com/status)
- [Honeycomb](https://ui.honeycomb.io/)
    - "service.name" = "galoy-\<env/cluster\>-dealer"
    - "code.function" = "createMarketOrder"
    - "error" = "true" ?
    - "error.level" ?
    - "code.function.results.result" ?
    - "code.function.params.args" ?
    - "span.event" ?

## 🚩Dealer is unable to open position warning ⚠
### Conditions
    liabilityInUsd >0 && exposure == 0, for >3h (6x 10min = 1h expected on-chain on average)

### Description
    - The liability in usd figure has been positive for >3h, yet the exposure (liability hedged on the exchange) is still zero
    - So the goal of the diagnostic is to figure out why the Dealer is or seems unable to open up a position so exposure == liability
        - Are there sufficient funds on the exchange to execute the trade and if not
        - Is the exchange down?
        - Are there authentication/other errors on orders sent from the Dealer to the exchange?
        - Are there any orders being initiated by the Dealer to establish the position?

### Checks for on-support
#### Diagnostic

1. [Honeycomb](https://ui.honeycomb.io/)
    - "service.name" = "galoy-\<env/cluster\>-dealer"
    - "code.function" = "createMarketOrder"
    - "error" = "true" ?
    - "span.event" contains "Insufficient funds" ?

1. Proceed as [above](./ALERTS.md#Dealer-is-unable-to-get-funds-on--off-the-exchange-alert) without transactions data:

1. Galoy Grafana Dashboard -> "lnd + bitcoind" chart has enough Onchain liquidity ?

## 🚩Dealer is not withdrawing funds from exchange alert
### Conditions
    liability == 0 && exposure == 0 && balance >0, for >3h (6x 10min = 1h expected on-chain on average)

### Description
    - The liability in usd figure and exposure has zero for >3h, yet the balance of fund on exchange is still positive
    - So the goal of the diagnostic is to figure out why the Dealer is or seems unable to move funds off the exchange as they should not be needed
        - Is the exchange down?
        - Are there authentication/other errors on orders sent from the Dealer to the exchange?
        - Are there any fund transfer request being initiated by the Dealer to move the funds?

### Checks for on-support
#### Diagnostic

- [Honeycomb](https://ui.honeycomb.io/)
    - "service.name" = "galoy-\<env/cluster\>-dealer"
    - "code.function" = "transfer"
    - "code.function" = "withdraw"
    - "code.function" = "payOnChain" (aka "deposit")
    - "error" = "true" ?
    - "error.level" ?
    - "code.function.results.result" ?
    - "code.function.params.args" ?
    - "span.event" ?


## 🚩Dealer is unable to trade warning ⚠
### Conditions
    liability != exposure, for >3h (6x 10min = 1h expected on-chain on average)

### Description
    - The liability in usd figure and exposure are not the same for >3h
    - So the goal of the diagnostic is to figure out why the Dealer is or seems unable to move funds off the exchange as they should not be needed
        - Is the exchange down?
        - Are there authentication/other errors on orders sent from the Dealer to the exchange?
        - Are there any fund transfer request being initiated by the Dealer to move the funds?

### Checks for on-support
#### Diagnostic

1. Proceed as [above](./ALERTS.md#Dealer-is-unable-to-get-funds-on--off-the-exchange-alert) without transactions data:

## 🚩Dealer is unable to determine exchange is alive alert
### Conditions
    exchange.fetchStatus().status != "ok" || call fail

### Description
    - The exchange status reporting endpoint is either unreachable or reports explicitly down status
    - So the goal of the diagnostic is to figure out if the exchange is down, in a planned maintenance window or else
        - Is the exchange down ?
        - Is the exchange in an on going maintenance ?
        - Is the Dealer unable to reach the exchange because of timeout/routing errors/else ?

### Checks for on-support
#### Diagnostic

- [OKX System Status](https://www.okx.com/api/v5/system/status)
- [OKX System Status Ongoing?](https://www.okx.com/api/v5/system/status?state=ongoing)
- [OKX Real-time System Maintenance Info](https://www.okx.com/status)
- [Honeycomb](https://ui.honeycomb.io/)
    - "service.name" = "galoy-\<env/cluster\>-dealer"
    - "code.function" = "transfer"
    - "name" = "HTTP GET" / "name" = "HTTPS GET"
    - "http.url" = "... okx.com ..." / "net.peer.name" = "www.okx.com"

