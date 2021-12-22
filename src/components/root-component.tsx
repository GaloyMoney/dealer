import appRoutes, { SupportedRoutes } from "server/routes"

const RootComponent = ({ path }: { path: RoutePath }) => {
  if (!path) {
    throw new Error("MISSING_ROOT_PATH")
  }

  const checkedRoutePath = SupportedRoutes.find(
    (supportedRoute) => supportedRoute === path,
  )

  if (!checkedRoutePath) {
    throw new Error("INVALID_ROOT_PATH")
  }

  const Component = appRoutes[checkedRoutePath].component
  return (
    <>
      <div className="main-container">
        <Component />
      </div>
      <div className="footer">
        <div className="powered-by">
          Powerd By{" "}
          <a href="https://galoy.io/" target="_blank" rel="noreferrer">
            Galoy
          </a>
        </div>
      </div>
    </>
  )
}

export default RootComponent
