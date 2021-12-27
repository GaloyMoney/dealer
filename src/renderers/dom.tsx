import * as ReactDOM from "react-dom"
import { ApolloProvider } from "@apollo/client"

import "../styles/index.css"

import Root from "components/root"
import client from "store/client"

const container = document.getElementById("root")

if (!container) {
  throw new Error("HTML_ROOT_ELEMENT_IS_MISSING")
}

ReactDOM.hydrateRoot(
  container,
  <ApolloProvider client={client}>
    <Root initialState={window.__G_DATA.initialState} />
  </ApolloProvider>,
)
