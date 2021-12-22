import * as ReactDOMServer from "react-dom/server"
import { Request } from "express"
import prepass from "react-ssr-prepass"

import appRoutes from "server/routes"
import Root from "components/root"
import { ssr } from "store"

export const serverRenderer =
  (req: Request) =>
  async ({ path }: { path: RoutePath }) => {
    const authToken = req.session?.authToken

    const initialState: InitialState = {
      path,
      authToken,
    }

    const element = <Root initialState={initialState} />

    await prepass(element)

    const initialMarkup = ReactDOMServer.renderToString(element)

    const ssrData = ssr.extractData()

    return Promise.resolve({
      initialState,
      ssrData,
      initialMarkup,
      pageData: appRoutes[path],
    })
  }
