export enum TradeCurrency {
  BTC = "BTC",
  USD = "USD",
}

export enum TradeSide {
  Buy = "buy",
  Sell = "sell",
  NoTrade = "",
}

export enum TradeType {
  Market = "market",
  Limit = "limit",
}

export interface TradeOrder {
  tradeSide: TradeSide
  quantity: number
  currency: TradeCurrency
}

export enum PositionSide {
  Short = "short",
  Long = "long",
  Net = "net",
}

export enum FundTransferSide {
  Withdraw = "withdraw",
  Deposit = "deposit",
  NoTransfer = "no_transfer",
}

export enum FundTransferStatus {
  Ok = "ok",
  Pending = "pending",
  Failed = "failed",
  Canceled = "canceled",
  Requested = "requested",
}

export interface FundTransfer {
  transferSide: FundTransferSide
  quantity: number
  currency: TradeCurrency
}

export enum OrderStatus {
  Open = "open",
  Closed = "closed",
  Canceled = "canceled",
}

export enum SupportedChain {
  BTC_Bitcoin = "BTC-Bitcoin",
  BTC_Lightning = "BTC-Lightning",
}

export interface FetchDepositAddressResult {
  originalResponseAsIs // the original JSON response from the exchange as is
  chain: SupportedChain
  currency: TradeCurrency
  address: string
}

export interface FetchDepositsParameters {
  address: string
  amountInSats: number
}

export interface FetchDepositsResult {
  originalResponseAsIs
  currency: TradeCurrency
  address: string
  amount: number
  status: FundTransferStatus
}

export interface WithdrawParameters {
  currency: TradeCurrency
  quantity: number
  address: string
}

export interface WithdrawResult {
  originalResponseAsIs
  id: string
  // status: FundTransferStatus
}

export interface FetchWithdrawalsParameters {
  address: string
  amountInSats: number
}

export interface FetchWithdrawalsResult {
  originalResponseAsIs
  currency: TradeCurrency
  address: string
  amount: number
  status: FundTransferStatus
}

export interface CreateOrderParameters {
  instrumentId: string
  type: TradeType
  side: TradeSide
  quantity: number
}

export interface CreateOrderResult {
  originalResponseAsIs
  id: string
}

export interface FetchOrderResult {
  originalResponseAsIs
  status: OrderStatus
}

export interface PrivateGetAccountResult {
  originalResponseAsIs
  marginFraction: number
  netSize: number
  collateral: number
  totalAccountValue: number
}

export interface FetchBalanceResult {
  originalResponseAsIs
  notionalLever: number
  btcFreeBalance: number
  btcUsedBalance: number
  btcTotalBalance: number
  totalEq: number
}

export interface FetchPositionResult {
  originalResponseAsIs
  last: number
  notionalUsd: number
  margin: number

  // extra positional risk data for monitoring
  autoDeleveragingIndicator: number // adl
  liquidationPrice: number // liqPx
  positionQuantity: number // pos
  positionSide: PositionSide // posSide
  averageOpenPrice: number // avgPx
  unrealizedPnL: number // upl
  unrealizedPnLRatio: number // uplRatio
  marginRatio: number // mgnRatio
  maintenanceMarginRequirement: number // mmr
  exchangeLeverage: number // lever
}

export interface FetchTickerResult {
  originalResponseAsIs
  lastBtcPriceInUsd: number
}

export interface GetAccountAndPositionRiskResult {
  originalPositionResponse
  originalBalanceResponse
  originalPosition: FetchPositionResult | undefined
  originalBalance: FetchBalanceResult | undefined
  lastBtcPriceInUsd: number
  leverage: number
  collateralInUsd: number
  exposureInUsd: number
  totalAccountValueInUsd: number
}

export interface GetInstrumentDetailsResult {
  originalResponseAsIs
  minimumOrderSizeInContract: number
  contractFaceValue: number
}

export interface GetPublicFundingRateResult {
  originalResponseAsIs
  fundingRate: number
  nextFundingRate: number
}

export interface SetAccountConfigurationResult {
  originalResponseAsIs
}

export enum ApiError {
  NOT_IMPLEMENTED = "Not Implemented",
  NOT_SUPPORTED = "Not Supported",
  UNSUPPORTED_CHAIN = "Unsupported Chain",
  UNSUPPORTED_CURRENCY = "Unsupported Currency",
  UNSUPPORTED_INSTRUMENT = "Unsupported Instrument",
  UNSUPPORTED_ADDRESS = "Unsupported Address",
  UNSUPPORTED_API_RESPONSE = "Unsupported API response",
  EMPTY_API_RESPONSE = "Empty API response",
  MISSING_PARAMETERS = "Missing Parameters",
  NON_POSITIVE_QUANTITY = "Non Positive Quantity",
  INVALID_TRADE_SIDE = "Invalid Trade Side",
  INVALID_POSITION_MODE = "Invalid Position Mode",
  INVALID_LEVERAGE_CONFIG = "Invalid Leverage Configuration",
  MISSING_ORDER_ID = "Missing Order Id",
  NON_POSITIVE_PRICE = "Non Positive Price",
  NON_POSITIVE_NOTIONAL = "Non Positive Notional",
  NON_POSITIVE_MARGIN = "Non Positive Margin",
  MISSING_ACCOUNT_VALUE = "Missing Account Value",
  NON_POSITIVE_ACCOUNT_VALUE = "Non Positive Account Value",
  MISSING_WITHDRAW_ID = "Missing withdraw id",
}
