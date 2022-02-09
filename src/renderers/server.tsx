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
      const galoyJwtToken = req.session?.galoyJwtToken

      const GwwState: GwwState = {
        path,
        props: req.query,
        key: 0,
        defaultLanguage: req.acceptsLanguages()?.[0],
      }

      const galoyClient = createClient({
        authToken: galoyJwtToken,
        headers: req.headers,
      })
      const App = (
        <SSRRoot client={galoyClient} GwwState={GwwState} galoyJwtToken={galoyJwtToken} />
      )

      const initialMarkup = await renderToStringWithData(App)
      const ssrData = galoyClient.extract()

      const { supportEmail, graphqlUri, graphqlSubscriptionUri, network, authEndpoint } =
        config

      return Promise.resolve({
        GwwState,
        GwwConfig: {
          supportEmail,
          graphqlUri,
          graphqlSubscriptionUri,
          network,
          authEndpoint,
        },
        initialMarkup,
        ssrData,
        pageData: appRoutes[path],
      })
    } catch (err) {
      console.error(err)
    }
  }
