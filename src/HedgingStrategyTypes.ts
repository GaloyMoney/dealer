import { GetAccountAndPositionRiskResult } from "./ExchangeTradingType"
import { Result } from "./Result"

export enum HedgingStrategies {
  FtxPerpetualSwap = "FTX_PERPETUAL_SWAP",
  OkexPerpetualSwap = "OKEX_PERPETUAL_SWAP",
  OkexInverseFutures = "OKEX_INVERSE_FUTURES",
}

export type Position = {
  leverage: number
  collateralInUsd: number
  exposureInUsd: number
  totalAccountValueInUsd: number
}

export type UpdatedPosition = {
  originalPosition: Position
  updatedPosition: Position
}

export type UpdatedBalance = {
  originalLeverageRatio: number
  liabilityInUsd: number
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
  getDerivativePriceInUsd(): Promise<Result<number>>
  getNextFundingRateInBtc(): Promise<Result<number>>
  getAccountAndPositionRisk(): Promise<Result<GetAccountAndPositionRiskResult>>

  isDepositCompleted(address: string, amountInSats: number): Promise<Result<boolean>>
  isWithdrawalCompleted(address: string, amountInSats: number): Promise<Result<boolean>>
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
