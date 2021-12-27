import { createHttpLink, ApolloClient, InMemoryCache } from "@apollo/client"

import config from "server/config"

import { Request } from "express"

import appRoutes from "server/routes"
import { renderToStringWithData } from "@apollo/client/react/ssr"
import { SSRRoot } from "components/root"

export const serverRenderer =
  (req: Request) =>
  async ({ path }: { path: RoutePath }) => {
    const authToken = req.session?.authToken

    const initialState: InitialState = {
      path,
      authToken,
      defaultLanguage: req.acceptsLanguages()?.[0],
    }

    const client = new ApolloClient({
      ssrMode: true,
      link: createHttpLink({
        uri: config.graphqlUri,
        headers: {
          authorization: authToken ? `Bearer ${authToken}` : "",
        },
      }),
      cache: new InMemoryCache(),
    })

    const App = <SSRRoot client={client} initialState={initialState} />

    const initialMarkup = await renderToStringWithData(App)
    const ssrData = client.extract()

    return Promise.resolve({
      initialState,
      initialMarkup,
      ssrData,
      pageData: appRoutes[path],
    })
  }
