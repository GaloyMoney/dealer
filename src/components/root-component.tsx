import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import appRoutes, { SupportedRoutes } from "server/routes"
import { translate } from "translate"
import ErrorFallback from "./error-fallback"
import Spinner from "./spinner"

type Props = { path: RoutePath }

const RootComponent = ({ path }: Props) => {
  const checkedRoutePath = SupportedRoutes.find(
    (supportedRoute) => supportedRoute === path,
  )
  if (!checkedRoutePath) {
    throw new Error("INVALID_ROOT_PATH")
  }

  const Component = appRoutes[checkedRoutePath].component
  return (
    <Suspense
      fallback={
        <div className="suspense-fallback">
          <Spinner size="big" />
        </div>
      }
    >
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div id="main-container">
          <Component />
        </div>
        <div id="footer">
          <div className="powered-by">
            {translate("Powered By")}{" "}
            <a href="https://galoy.io/" target="_blank" rel="noreferrer">
              Galoy
            </a>
          </div>
        </div>
      </ErrorBoundary>
    </Suspense>
  )
}

export default RootComponent
