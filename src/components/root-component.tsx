import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Spinner } from "@galoymoney/react"

import appRoutes, { checkRoute } from "../server/routes"

import ErrorFallback from "./error-fallback"

type Props = {
  path: RoutePath
  [name: string]: unknown
}

const RootComponent = ({ path, ...props }: Props) => {
  const checkedRoutePath = checkRoute(path)
  if (checkedRoutePath instanceof Error) {
    throw checkedRoutePath
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
          <Component {...props} />
        </div>
      </ErrorBoundary>
    </Suspense>
  )
}

export default RootComponent
