import "styles/index.css"

import * as ReactDOM from "react-dom/client"
import { ErrorBoundary } from "react-error-boundary"

import Root from "components/root"
import ErrorFallback from "components/error-fallback"
import { setColorThemeFromStorage } from "store/index"

const container = document.getElementById("root")

if (!container) {
  throw new Error("HTML_ROOT_ELEMENT_IS_MISSING")
}

setColorThemeFromStorage()

const root = ReactDOM.createRoot(container)

root.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <Root GwwState={window.__G_DATA.GwwState} />
  </ErrorBoundary>,
)
