import { gql } from "@apollo/client"

const QUERY_MAIN = gql`
  query me($hasToken: Boolean!) {
    globals {
      nodesIds
    }
    btcPrice {
      base
      offset
      currencyUnit
      formattedAmount
    }
    me @include(if: $hasToken) {
      id
      username
      language
      defaultAccount {
        id
        wallets {
          id
          balance
        }
      }
    }
  }
`

export default QUERY_MAIN
