import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client"
import { Request } from "express"

import config from "server/config"
import appRoutes from "server/routes"
import Root from "components/root"
import { renderToStringWithData } from "@apollo/client/react/ssr"

export const serverRenderer =
  (req: Request) =>
  async ({ path }: { path: RoutePath }) => {
    const authToken = req.session?.authToken

    const initialState: InitialState = {
      path,
      authToken,
    }

    const cache = new InMemoryCache()
    const client = new ApolloClient({
      ssrMode: true,
      link: createHttpLink({
        uri: config.graphqlUri,
        headers: {
          authorization: authToken ? `Bearer ${authToken}` : "",
        },
      }),
      cache,
    })

    const App = (
      <ApolloProvider client={client}>
        <Root initialState={initialState} />
      </ApolloProvider>
    )

    const initialMarkup = await renderToStringWithData(App)
    const ssrData = client.extract()

    return Promise.resolve({
      initialState,
      initialMarkup,
      ssrData,
      pageData: appRoutes[path],
    })
  }
