// Galoy Client
type NormalizedCacheObject = import("@galoymoney/client").NormalizedCacheObject

type PaymentType = import("@galoymoney/client").PaymentType

type Transaction = import("@galoymoney/client").GaloyGQL.Transaction
type SettlementType = import("@galoymoney/client").GaloyGQL.SettlementVia["__typename"]
type IntraLedgerUpdate = import("@galoymoney/client").GaloyGQL.IntraLedgerUpdate
type LnUpdate = import("@galoymoney/client").GaloyGQL.LnUpdate
type OnChainUpdate = import("@galoymoney/client").GaloyGQL.OnChainUpdate

// Helpers
type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>

// Server and state
type RoutePath = typeof import("../server/routes").SupportedRoutes[number]
type RouteInfo = Record<string, string | (() => JSX.Element | null)>
type AppRoutes = Record<RoutePath, RouteInfo>

type GwwState = {
  path: RoutePath
  key: number
  authToken?: string
  defaultLanguage?: string
}

type GwwAction = {
  type: "update"
  [payloadKey: string]: string | undefined
}

type GwwContextType = {
  state: GwwState
  dispatch: React.Dispatch<GwwAction>
}

type ServerRendererFunction = (path: RoutePath) => Promise<{
  GwwState: GwwState
  initialMarkup: string
  pageData: RouteInfo
}>

declare interface Window {
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

// Hooks

type UseAuthTokenFunction = () => {
  authToken: string | undefined
  hasToken: boolean
}

type UseMyUpdates = {
  satsToUsd: ((sats: number) => number) | null
  usdToSats: ((usd: number) => number) | null
  currentBalance: number | null
  intraLedgerUpdate: IntraLedgerUpdate | null
  lnUpdate: LnUpdate | null
  onChainUpdate: OnChainUpdate | null
}

type Currency = "USD" | "SATS"

type InvoiceInput = {
  currency: Currency

  // undefined in input is used to indicate their changing state
  amount?: number | ""
  destination?: string
  memo?: string

  satAmount?: number // from price conversion

  valid?: boolean // from parsing
  errorMessage?: string
  paymentType?: PaymentType

  sameNode?: boolean
  fixedAmount?: boolean // if the invoice has amount
  paymentRequest?: string // if payment is lightning
  address?: string // if payment is onchain
  recipientWalletId?: string // if payment is intraledger

  newDestination?: string // for scanned codes
}

// Components

type SendActionProps = InvoiceInput & {
  btcWalletId: string
  btcWalletBalance: number
  reset: () => void
}

type SendOnChainActionProps = SendActionProps & {
  address: string
  satAmount: number
}

type SendLnActionProps = SendActionProps & {
  paymentRequest: string
}

type SendLnNoAmountActionProps = SendLnActionProps & {
  satAmount: number
}

type SendIntraLedgerActionProps = SendActionProps & {
  recipientWalletId: string
  satAmount: number
}

type TransactionDetailProps = {
  tx: Transaction
  isReceive: boolean
  isPending: boolean
  description: string
  usdAmount: number
}
