# Dealer Alerts

## Dealer is unable to get funds on / off the exchange alert

### Conditions
    in-flight transfer >0, for 3h (1h expected on average)

### Checks for on-support
#### References
- https://galoymoney.github.io/galoy/
- https://galoymoney.github.io/galoy/#query-me
- https://galoymoney.github.io/galoy/#mutation-userLogin
		
#### API URL
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
    - "memo": "deposit of <some amount> btc to OkexPerpetualSwapStrategy",
    - "memo": "withdrawal of <some amount> btc from OkexPerpetualSwapStrategy",
    - "status" === "PENDING"?
    - "settlementVia.__typename" === "SettlementViaOnChain"
    - "transactionHash" on btc explorer
    - etc.
			
## Dealer is unable to get liability from Galoy Wallet alert
### Conditions
    liability isNaN

### Checks for on-support

#### Diagnostic

1. Proceed as [above](./ALERTS.md#Dealer-is-unable-to-get-funds-on-off-the-exchange-alert) without transactions data:
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

## Dealer is unable to close position warning
### Conditions
    liability == 0 && exposure >0, for 3h (1h expected on average)

### Checks for on-support
#### Diagnostic
- API: https://www.okx.com/api/v5/system/status
- API: https://www.okx.com/api/v5/system/status?state=ongoing
- WEB: https://www.okx.com/status
- Honeycomb: https://ui.honeycomb.io/
    - "service.name" = "galoy-<env/cluster>-dealer"
    - "code.function" = "createMarketOrder"
    - "error" = "true" ?
    - "error.level" ?
    - "code.function.results.result" ?
    - "code.function.params.args" ?
    - "span.event" ?

## Dealer is unable to open position warning
### Conditions
    liability >0 && exposure == 0, for 3h (1h expected on average)

### Checks for on-support
#### Diagnostic

1. Proceed as [above](./ALERTS.md#Dealer-is-unable-to-get-funds-on-off-the-exchange-alert) without transactions data:

## Dealer is unable to trade warning
### Conditions
    liability != exposure, for 3h (1h expected on average)

### Checks for on-support
#### Diagnostic

1. Proceed as [above](./ALERTS.md#Dealer-is-unable-to-get-funds-on-off-the-exchange-alert) without transactions data:

## Dealer is unable to determine exchange is alive alert
### Conditions
    exchange.fetchStatus().status != "ok" || call fail

### Checks for on-support
#### Diagnostic

- API: https://www.okx.com/api/v5/system/status
- API: https://www.okx.com/api/v5/system/status?state=ongoing
- WEB: https://www.okx.com/status


