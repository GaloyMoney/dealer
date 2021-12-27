import { gql } from "@apollo/client"

const SUBSCRIPTION_MY_UPDATES = gql`
  subscription myUpdates {
    myUpdates {
      errors {
        message
      }
      me {
        id
        defaultAccount {
          id
          wallets {
            id
            walletCurrency
            balance
          }
        }
      }
      update {
        type: __typename
        ... on Price {
          base
          offset
          currencyUnit
          formattedAmount
        }
        ... on LnUpdate {
          paymentHash
          status
        }
        ... on OnChainUpdate {
          txNotificationType
          txHash
          amount
          usdPerSat
        }
        ... on IntraLedgerUpdate {
          txNotificationType
          amount
          usdPerSat
        }
      }
    }
  }
`

export default SUBSCRIPTION_MY_UPDATES
