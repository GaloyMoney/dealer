import * as React from "react"
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  split,
  HttpLink,
} from "@apollo/client"
import { WebSocketLink } from "@apollo/client/link/ws"
import { getMainDefinition } from "@apollo/client/utilities"

import { GRAPHQL_URI, GRAPHQL_SUBSCRIPTION_URI } from "./config"

const httpLink = new HttpLink({
  uri: GRAPHQL_URI,
})

const wsLink = new WebSocketLink({
  uri: GRAPHQL_SUBSCRIPTION_URI,
  options: {
    reconnect: true,
  },
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === "OperationDefinition" && definition.operation === "subscription"
    )
  },
  wsLink,
  httpLink,
)

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})

export default ({ children }: { children: React.ReactNode }) => (
  <ApolloProvider client={client}>{children}</ApolloProvider>
)
