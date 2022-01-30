import { Request } from "express"
import { renderToStringWithData } from "@galoymoney/client"

import config from "../store/config"
import { createClient } from "../store"
import appRoutes from "../server/routes"

import { SSRRoot } from "../components/root"

export const serverRenderer =
  (req: Request) =>
  async ({ path }: { path: RoutePath }) => {
    try {
      const authToken = req.session?.authToken

      const GwwState: GwwState = {
        path,
        key: 0,
        authToken,
        defaultLanguage: req.acceptsLanguages()?.[0],
      }

      const galoyClient = createClient({
        authToken,
        headers: req.headers,
      })
      const App = <SSRRoot client={galoyClient} GwwState={GwwState} />

      const initialMarkup = await renderToStringWithData(App)
      const ssrData = galoyClient.extract()

      const { supportEmail, graphqlUri, graphqlSubscriptionUri, authEndpoint } = config

      return Promise.resolve({
        GwwState,
        GwwConfig: { supportEmail, graphqlUri, graphqlSubscriptionUri, authEndpoint },
        initialMarkup,
        ssrData,
        pageData: appRoutes[path],
      })
    } catch (err) {
      console.error(err)
    }
  }
