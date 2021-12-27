import { Suspense } from "react"
import appRoutes, { SupportedRoutes } from "server/routes"
import { translate } from "translate"
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
    <Suspense fallback={<Spinner size="big" />}>
      <div className="main-container">
        <Component />
      </div>
      <div className="footer">
        <div className="powered-by">
          {translate("Powered By")}{" "}
          <a href="https://galoy.io/" target="_blank" rel="noreferrer">
            Galoy
          </a>
        </div>
      </div>
    </Suspense>
  )
}

export default RootComponent
