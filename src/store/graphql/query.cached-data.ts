import { gql } from "@apollo/client"

export const CACHED_DATA = gql`
  query localAppState {
    authToken @client
  }
`

export default CACHED_DATA
