import { Request } from "express"
import { createHttpLink, ApolloClient, InMemoryCache } from "@apollo/client"
import { renderToStringWithData } from "@apollo/client/react/ssr"

import config from "store/config"
import appRoutes from "server/routes"
import { SSRRoot } from "components/root"

export const serverRenderer =
  (req: Request) =>
  async ({ path }: { path: RoutePath }) => {
    const authToken = req.session?.authToken

    const GwwState: GwwState = {
      path,
      key: 0,
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

    const App = <SSRRoot client={client} GwwState={GwwState} />

    const initialMarkup = await renderToStringWithData(App)
    const ssrData = client.extract()

    return Promise.resolve({
      GwwState,
      initialMarkup,
      ssrData,
      pageData: appRoutes[path],
    })
  }
