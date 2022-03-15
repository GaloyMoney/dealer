import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Spinner } from "@galoymoney/react"

import { appRoutes, checkRoute, authRoutes, checkAuthRoute } from "server/routes"

import ErrorFallback from "components/error-fallback"

type FCT = React.FC<{
  path: RoutePath | AuthRoutePath
  flowData?: KratosFlowData
  [name: string]: unknown
}>

const RootComponent: FCT = ({ path, flowData, ...props }) => {
  const checkedRoutePath = checkRoute(path)

  if (!(checkedRoutePath instanceof Error)) {
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
            <Component {...props} />
          </div>
        </ErrorBoundary>
      </Suspense>
    )
  }

  const checkedAuthRoutePath = checkAuthRoute(path)
  if (!(checkedAuthRoutePath instanceof Error)) {
    const Component = authRoutes[checkedAuthRoutePath].component

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
            <Component flowData={flowData} {...props} />
          </div>
        </ErrorBoundary>
      </Suspense>
    )
  }

  throw checkedRoutePath
}

export default RootComponent
