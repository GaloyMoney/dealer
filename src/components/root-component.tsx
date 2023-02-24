import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Spinner } from "@galoymoney/react"

import {
  appRoutes,
  checkRoute,
  authRoutes,
  checkAuthRoute,
  ValidPath,
} from "server/routes"

import { KratosFlowData } from "kratos/index"
import useMainQuery from "hooks/use-main-query"

import ErrorFallback from "components/error-fallback"

type FCT = React.FC<{
  path: ValidPath
  flowData?: KratosFlowData
  [name: string]: unknown
}>

const RootComponent: FCT = ({ path, flowData, ...props }) => {
  const checkedRoutePath = checkRoute(path)
  const { language } = useMainQuery()

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
          <div id="main-container" data-language={language}>
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
