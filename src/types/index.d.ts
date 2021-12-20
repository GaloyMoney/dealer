type RoutePath = typeof import("../server/routes").SupportedRoutes[number]
type RouteInfo = Record<string, string | (() => JSX.Element)>
type AppRoutes = Record<RoutePath, RouteInfo>

type InitialState = {
  path: RoutePath
  authToken?: string
}

declare interface Window {
  __G_DATA: {
    initialState: InitialState
  }
}

type ServerRendererFunction = (path: RoutePath) => Promise<{
  initialState: InitialState
  initialMarkup: string
  pageData: RouteInfo
}>

type GwwState = {
  path: string
  authToken?: string
}

type GwwAction = {
  type: "state" | "logout"
  [payloadKey: string]: string
}

type GwwContextType = {
  state: GwwState
  dispatch: React.Dispatch<GwwAction>
}

type GeetestValidationData = {
  geetestChallenge: string
  geetestSecCode: string
  geetestValidate: string
}

type CaptchaRequestAuthCodeData = {
  errors: unknown[]
  success: boolean
}

type GeetestCaptchaReturn = {
  geetestError: string | null
  geetestValidationData: GeetestValidationData | null
  loadingRegisterCaptcha: boolean
  registerCaptcha: () => void
  resetError: () => void
  resetValidationData: () => void
}
