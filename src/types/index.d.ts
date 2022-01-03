type NormalizedCacheObject = import("@apollo/client").NormalizedCacheObject

type RoutePath = typeof import("../server/routes").SupportedRoutes[number]
type RouteInfo = Record<string, string | (() => JSX.Element)>
type AppRoutes = Record<RoutePath, RouteInfo>

type PriceData = {
  formattedAmount: string
  base: number
  offset: number
  currencyUnit: string
}

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
  type: "navigate"
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

type CachedData = {
  authToken: string
  satPriceInCents: number
}

type IntraLedgerUpdate = {
  txNotificationType: string
  amount: number
  usdPerSat: number
}

type LnUpdate = {
  paymentHash: string
  status: string
}

type OnChainUpdate = {
  txNotificationType: string
  txHash: string
  amount: number
  usdPerSat: number
}

type UseMyUpdates = {
  satsToUsd: ((sats: number) => number) | null
  usdToSats: ((usd: number) => number) | null
  currentBalance: number | null
  intraLedgerUpdate: IntraLedgerUpdate | null
  lnUpdate: LnUpdate | null
  onChainUpdate: OnChainUpdate | null
}

type SpinnerSize = "small" | "big"
