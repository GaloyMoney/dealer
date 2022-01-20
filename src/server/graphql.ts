import { Request } from "express"
import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client"

import config from "store/config"

const client = (req: Request) => {
  const authToken = req.session?.authToken
  return new ApolloClient({
    ssrMode: true,
    link: createHttpLink({
      uri: config.graphqlUri,
      headers: {
        "authorization": authToken ? `Bearer ${authToken}` : "",
        "x-real-ip": req.headers["x-real-ip"],
        "x-forwarded-for": req.headers["x-forwarded-for"],
      },
    }),
    cache: new InMemoryCache(),
  })
}

export default client
