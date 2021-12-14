type RoutePath = typeof import("../server/routes").SupportedRoutes[number]
type RouteInfo = Record<string, string | (() => JSX.Element)>
type AppRoutes = Record<RoutePath, RouteInfo>

type InitialData = {
  path: RoutePath
  appRoutes: AppRoutes
}

declare interface Window {
  __G_DATA: {
    initialData: InitialData
  }
}

type ServerRendererFunction = (path: RoutePath) => Promise<{
  initialData: InitialData
  initialMarkup: string
  pageData: RouteInfo
}>

type GwwState = {
  rootComponentPath?: string
}

type GwwAction = {
  type: "navigateTo"
  [payloadKey: string]: string
}

type GwwContextType = {
  state: GwwState
  dispatch: React.Dispatch<GwwAction>
}
