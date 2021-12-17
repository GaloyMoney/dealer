import * as ReactDOMServer from "react-dom/server"

import appRoutes from "server/routes"
import Root from "components/root"

export const serverRenderer = async ({
  path,
  authToken,
}: {
  path: RoutePath
  authToken: string
}) => {
  const initialState = {
    path,
    authToken,
  }

  return Promise.resolve({
    initialState,
    initialMarkup: ReactDOMServer.renderToString(<Root initialState={initialState} />),
    pageData: appRoutes[path],
  })
}
