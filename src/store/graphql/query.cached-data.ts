import { gql } from "@apollo/client"

const CACHED_DATA = gql`
  query cachedData {
    satPriceInCents @client
  }
`

export default CACHED_DATA
