import { ApolloClient, InMemoryCache, ApolloLink, from, HttpLink } from "@apollo/client"

import config from "server/config"
import { getCachedAuthToken, setCachedAuthToken } from "./use-auth-token"

export const cache = new InMemoryCache().restore(window.__G_DATA.ssrData)

const authLink = new ApolloLink((operation, forward) => {
  const user = getCachedAuthToken(cache)
  operation.setContext(({ headers }: { headers: Record<string, string> }) => ({
    headers: {
      authorization: user ? `Bearer ${user.authToken}` : "",
      ...headers,
    },
  }))
  return forward(operation)
})

const httpLink = new HttpLink({ uri: config.graphqlUri })

const client = new ApolloClient({
  cache,
  link: from([authLink, httpLink]),
})

if (window.__G_DATA.initialState.authToken) {
  setCachedAuthToken(client)(window.__G_DATA.initialState.authToken)
}

export default client
