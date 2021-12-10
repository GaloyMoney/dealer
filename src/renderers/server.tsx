import * as ReactDOMServer from "react-dom/server"

import Root from "components/root"

export const serverRenderer = async (): Promise<NestedObject> => {
  const initialData = {
    appName: "Galoy",
  }

  const pageData = {
    title: initialData.appName,
  }

  return Promise.resolve({
    initialData,
    initialMarkup: ReactDOMServer.renderToString(<Root />),
    pageData,
  })
}
