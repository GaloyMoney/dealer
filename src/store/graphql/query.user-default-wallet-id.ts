import { gql } from "@apollo/client"

const QUERY_USER_DEFAULT_WALLET_ID = gql`
  query userDefaultWalletId($username: Username!) {
    userDefaultWalletId(username: $username)
  }
`

export default QUERY_USER_DEFAULT_WALLET_ID
