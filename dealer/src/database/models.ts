export interface InFlightTransfer {
  id?: number
  isDepositOnExchange: boolean
  address: string
  transferSizeInSats: number
  memo: string
  isCompleted: boolean
  updatedTimestamp?: string
  createdTimestamp?: string
}

export interface WalletObject {
  id: string
  balance: {
    currency: string
    amount: number
  }
}

export interface Wallet {
  id?: number
  jsonData: WalletObject[]
  updatedTimestamp?: string
  createdTimestamp?: string
}

export interface LastOnChainAddressObject {
  id: string
}

export interface LastOnChainAddress {
  id?: number
  jsonData: LastOnChainAddressObject
  updatedTimestamp?: string
  createdTimestamp?: string
}

export interface OnChainPayObject {
  address: string
  amount: number
  memo: string
}

export interface OnChainPay {
  id?: number
  jsonData: OnChainPayObject
  updatedTimestamp?: string
  createdTimestamp?: string
}

export interface Transaction {
  id?: number
  balance: number
  balanceChange: number
  billId: number
  currency: string
  executionType?: string
  fee?: number
  fromAccountId?: number
  instrumentId?: string
  instrumentType?: string
  marginMode?: string
  notes?: string
  orderId?: string
  pnl?: number
  positionBalance?: number
  positionBalanceChange?: number
  billSubtypeId: number
  quantity?: number
  toAccountId?: number
  timestamp?: string
  billTypeId: number
  updatedTimestamp?: string
  createdTimestamp?: string
}

export enum TransactionBillTypeToId {
  Transfer = 1,
  Trade = 2,
  Liquidation = 5,
  FundingFee = 8,
}

export enum TransactionBillSubtypeToId {
  Buy = 1,
  Sell = 2,
  FundingFeeExpense = 173,
  FundingFeeIncome = 174,
}

export type TradingFeesMetrics = {
  tradingFeesTotalInSats: number
  tradingFeesBuyInSats: number
  tradingFeesBuyCount: number
  tradingFeesSellInSats: number
  tradingFeesSellCount: number
}

export type FundingFeesMetrics = {
  fundingFeesTotalInSats: number
  fundingFeesExpenseInSats: number
  fundingFeesExpenseCount: number
  fundingFeesIncomeInSats: number
  fundingFeesIncomeCount: number
}

export interface Order {
  id?: number
  instrumentId: string
  orderType: string
  side: string
  quantity: number
  tradeMode: string
  positionSide: string
  statusCode?: string
  statusMessage?: string
  orderId?: string
  clientOrderId?: string
  success: boolean
  updatedTimestamp?: string
  createdTimestamp?: string
}

export interface InternalTransfer {
  id?: number
  currency: string
  quantity: number
  fromAccountId: number
  toAccountId: number
  instrumentId?: string
  transferId?: string
  success: boolean
  updatedTimestamp?: string
  createdTimestamp?: string
}

export interface ExternalTransfer {
  id?: number
  isDepositNotWithdrawal: boolean
  currency: string
  quantity: number
  destinationAddressTypeId: number
  toAddress: string
  fundPassword: string
  fee: number
  chain?: string
  transferId?: string
  success: boolean
  updatedTimestamp?: string
  createdTimestamp?: string
}
