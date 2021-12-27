import * as ReactDOM from "react-dom"

import Root from "components/root"

import "../styles/index.css"

const container = document.getElementById("root")

if (!container) {
  throw new Error("HTML_ROOT_ELEMENT_IS_MISSING")
}

ReactDOM.hydrateRoot(container, <Root initialState={window.__G_DATA.initialState} />)
