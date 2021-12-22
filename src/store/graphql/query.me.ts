import { gql } from "urql"

const QUERY_ME = gql`
  query me($hasToken: Boolean!) {
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
