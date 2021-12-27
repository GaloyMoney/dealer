type NormalizedCacheObject = import("@apollo/client").NormalizedCacheObject

type RoutePath = typeof import("../server/routes").SupportedRoutes[number]
type RouteInfo = Record<string, string | (() => JSX.Element)>
type AppRoutes = Record<RoutePath, RouteInfo>

type InitialState = {
  path: RoutePath
  authToken?: string
  defaultLanguage?: string
}

declare interface Window {
  __G_DATA: {
    initialState: InitialState
    ssrData: NormalizedCacheObject
  }
}

type ServerRendererFunction = (path: RoutePath) => Promise<{
  initialState: InitialState
  initialMarkup: string
  pageData: RouteInfo
}>

type GwwState = {
  path: RoutePath
  authToken?: string
  defaultLanguage?: string
}

type GwwAction = {
  type: "navigate" | "logout"
  [payloadKey: string]: string | undefined
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

type UseAuthTokenFunction = () => {
  authToken: string | undefined
  hasToken: boolean
}
