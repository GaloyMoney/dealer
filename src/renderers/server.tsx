import * as ReactDOMServer from "react-dom/server"

import appRoutes from "server/routes"
import Root from "components/root"

export const serverRenderer = async (path: RoutePath) => {
  const initialData = {
    appRoutes,
    path,
  }

  return Promise.resolve({
    initialData,
    initialMarkup: ReactDOMServer.renderToString(<Root initialData={initialData} />),
    pageData: appRoutes[path],
  })
}
