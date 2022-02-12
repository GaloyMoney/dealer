import config from "../store/config"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Spinner } from "@galoymoney/react"

import { appRoutes, checkRoute, authRoutes, checkAuthRoute } from "../server/routes"

import ErrorFallback from "./error-fallback"

type Props = {
  path: RoutePath
  flowData?: KratosFlowData
  [name: string]: unknown
}

const RootComponent = ({ path, flowData, ...props }: Props) => {
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
  if (config.kratosFeatureFlag) {
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
  }

  throw checkedRoutePath
}

export default RootComponent
