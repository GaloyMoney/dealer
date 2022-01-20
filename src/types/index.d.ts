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

type GwwState = {
  path: RoutePath
  key: number
  authToken?: string
  defaultLanguage?: string
}

type GwwAction = {
  type: "navigate" | "reset-current-screen"
  [payloadKey: string]: string | undefined
}

type GwwContextType = {
  state: GwwState
  dispatch: React.Dispatch<GwwAction>
}

declare interface Window {
  __G_DATA: {
    GwwState: GwwState
    ssrData: NormalizedCacheObject
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initGeetest: (...args: any[]) => void
}

type ServerRendererFunction = (path: RoutePath) => Promise<{
  GwwState: GwwState
  initialMarkup: string
  pageData: RouteInfo
}>

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

type InvoiceInput = {
  currency: "USD" | "SATS"

  // undefined in input is used to indicate their changing state
  amount?: number | ""
  destination?: string
  memo?: string

  satAmount?: number // from price conversion

  valid?: boolean // from parsing
  errorMessage?: string
  paymentType?: "lightning" | "onchain" | "intraledger" | "lnurl"

  sameNode?: boolean
  fixedAmount?: boolean // if the invoice has amount
  paymentRequset?: string // if payment is lightning
  address?: string // if payment is onchain
  reciepientWalletId?: string // if payment is intraledger
}

type SendActionProps = InvoiceInput & {
  btcWalletId: string
  reset: () => void
}
