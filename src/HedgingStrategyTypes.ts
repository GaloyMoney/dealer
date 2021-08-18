import { Result } from "./Result"

export enum HedgingStrategies {
  FtxPerpetualSwap = "FtxPerpetualSwap",
  OkexPerpetualSwap = "OkexPerpetualSwap",
  OkexInverseFutures = "OkexInverseFutures",
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
  getBtcSpotPriceInUsd(): Promise<Result<number>>
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
