import * as ReactDOM from "react-dom"

import Root from "components/root"

import "../styles/index.css"
import { ssr } from "store"

const container = document.getElementById("root")

if (!container) {
  throw new Error("HTML_ROOT_ELEMENT_IS_MISSING")
}

ssr.restoreData(window.__G_DATA.ssrData)

ReactDOM.hydrateRoot(container, <Root initialState={window.__G_DATA.initialState} />)
