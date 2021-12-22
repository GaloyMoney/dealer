import * as ReactDOMServer from "react-dom/server"
import { Request } from "express"

import appRoutes from "server/routes"
import Root from "components/root"

export const serverRenderer =
  (req: Request) =>
  async ({ path }: { path: RoutePath }) => {
    const authToken = req.session?.authToken

    const initialState: InitialState = {
      path,
      authToken,
    }

    const element = <Root initialState={initialState} />

    const initialMarkup = ReactDOMServer.renderToString(element)

    return Promise.resolve({
      initialState,
      initialMarkup,
      pageData: appRoutes[path],
    })
  }
