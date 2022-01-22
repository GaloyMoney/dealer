type NormalizedCacheObject = import("@apollo/client").NormalizedCacheObject
type BarcodeDetector = typeof import("barcode-detector/dist/BarcodeDetector").default

type RoutePath = typeof import("../server/routes").SupportedRoutes[number]
type RouteInfo = Record<string, string | (() => JSX.Element | null)>
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
  BarcodeDetector: BarcodeDetector
  __G_DATA: {
    GwwState: GwwState
    ssrData: NormalizedCacheObject
    GwwConfig: {
      supportEmail: string
      graphqlUri: string
      graphqlSubscriptionUri: string
      authEndpoint: string
    }
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

type UseMyUpdates = {
  satsToUsd: ((sats: number) => number) | null
  usdToSats: ((usd: number) => number) | null
  currentBalance: number | null
  intraLedgerUpdate: import("@galoymoney/client").GaloyGQL.IntraLedgerUpdate | null
  lnUpdate: import("@galoymoney/client").GaloyGQL.LnUpdate | null
  onChainUpdate: import("@galoymoney/client").GaloyGQL.OnChainUpdate | null
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

  newDestination?: string // for scanned codes
}

type SendActionProps = InvoiceInput & {
  btcWalletId: string
  reset: () => void
}

type SendOnChainActionProps = SendActionProps & {
  address: string
  satAmount: number
}

type SendLnActionProps = SendActionProps & {
  paymentRequset: string
}

type SendLnNoAmountActionProps = SendLnActionProps & {
  satAmount: number
}

type BarCode = {
  rawValue: string
}
