import { gql } from "@apollo/client"

const QUERY_ME = gql`
  query me($hasToken: Boolean!) {
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

export default QUERY_ME
