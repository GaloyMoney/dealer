import * as ReactDOM from "react-dom"

import Root from "components/root"

import "../styles/index.css"
import { ErrorBoundary } from "react-error-boundary"
import ErrorFallback from "components/error-fallback"

const container = document.getElementById("root")

if (!container) {
  throw new Error("HTML_ROOT_ELEMENT_IS_MISSING")
}

ReactDOM.hydrateRoot(
  container,
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <Root initialState={window.__G_DATA.initialState} />
  </ErrorBoundary>,
)
