import { FundingRate, Transaction } from "./database/models"
import {
  FetchFundingAccountBalanceResult,
  FetchTickerResult,
  GetAccountAndPositionRiskResult,
  GetFundingRateHistoryParameters,
  GetTransactionHistoryParameters,
} from "./ExchangeTradingType"
import { Result } from "./Result"

export enum HedgingStrategies {
  OkexPerpetualSwap = "OKEX_PERPETUAL_SWAP",
  OkexInverseFutures = "OKEX_INVERSE_FUTURES",
}

export type Position = {
  leverage: number
  usedCollateralInUsd: number
  totalCollateralInUsd: number
  exposureInUsd: number
  totalAccountValueInUsd: number
}

export type UpdatedPosition = {
  originalPosition: Position
  updatedPosition: Position
}

export type UpdatedBalance = {
  originalLeverageRatio: number
  exposureInUsd: number
  collateralInUsd: number
  newLeverageRatio: number
}

export interface WithdrawBookKeepingCallback {
  (onChainAddress, transferSizeInBtc: number): Promise<Result<void>>
}

export interface DepositOnExchangeCallback {
  (onChainAddress, transferSizeInBtc: number): Promise<Result<void>>
}

export interface HedgingStrategy {
  name: string
  getBtcSpotPriceInUsd(): Promise<Result<number>>

  getSpotPriceInUsd(): Promise<Result<number>>
  getMarkPriceInUsd(): Promise<Result<number>>
  getDerivativePriceInUsd(): Promise<Result<number>>
  getDerivativeMarketInfo(): Promise<Result<FetchTickerResult>>
  getNextFundingRateInBtc(): Promise<Result<number>>
  getFundingAccountBalance(): Promise<Result<FetchFundingAccountBalanceResult>>
  getAccountAndPositionRisk(): Promise<Result<GetAccountAndPositionRiskResult>>
  fetchExchangeStatus(): Promise<Result<boolean>>

  fetchTransactionHistory(
    args: GetTransactionHistoryParameters,
  ): Promise<Result<Transaction[]>>

  fetchFundingRateHistory(
    args: GetFundingRateHistoryParameters,
  ): Promise<Result<FundingRate[]>>

  isDepositCompleted(address: string, amountInSats: number): Promise<Result<boolean>>
  isWithdrawalCompleted(address: string, amountInSats: number): Promise<Result<boolean>>
  closePosition(): Promise<Result<boolean>>
  updatePosition(
    liabilityInUsd: number,
    btcPriceInUsd: number,
  ): Promise<Result<UpdatedPosition>>
  updateLeverage(
    liabilityInUsd: number,
    btcPriceInUsd: number,
    withdrawFromExchangeOnChainAddress,
    withdrawBookKeepingCallback: WithdrawBookKeepingCallback,
    depositOnExchangeCallback: DepositOnExchangeCallback,
  ): Promise<Result<UpdatedBalance>>
}
