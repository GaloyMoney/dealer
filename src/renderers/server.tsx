import { Request } from "express"
import { renderToStringWithData } from "@apollo/client/react/ssr"

import config from "../store/config"
import client from "../server/graphql"
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

    const apolloClient = client(req)
    const App = <SSRRoot client={apolloClient} GwwState={GwwState} />

    const initialMarkup = await renderToStringWithData(App)
    const ssrData = apolloClient.extract()

    const { supportEmail, graphqlUri, graphqlSubscriptionUri, authEndpoint } = config

    return Promise.resolve({
      GwwState,
      GwwConfig: { supportEmail, graphqlUri, graphqlSubscriptionUri, authEndpoint },
      initialMarkup,
      ssrData,
      pageData: appRoutes[path],
    })
  }
