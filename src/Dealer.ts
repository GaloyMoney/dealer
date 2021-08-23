import pino from "pino"
import { Result } from "./Result"
import { btc2sat } from "./utils"
import {
  HedgingStrategies,
  HedgingStrategy,
  UpdatedBalance,
  UpdatedPosition,
} from "./HedgingStrategyTypes"
import {
  InFlightTransfer,
  InFlightTransferDb,
  InFlightTransferDirection,
} from "./InFlightTransferDb"
import { GaloyWallet } from "./GaloyWalletTypes"
import { createHedgingStrategy } from "./HedgingStrategyFactory"
import { createDealerWallet, WalletType } from "./DealerWalletFactory"
import { GetAccountAndPositionRiskResult } from "./ExchangeTradingType"

const MINIMUM_POSITIVE_LIABILITY = 1

export type UpdatedPositionAndLeverageResult = {
  updatePositionSkipped: boolean
  updatedPositionResult: Result<UpdatedPosition>
  updatedLeverageSkipped: boolean
  updatedLeverageResult: Result<UpdatedBalance>
}

export class Dealer {
  private wallet: GaloyWallet
  private strategy: HedgingStrategy
  private database: InFlightTransferDb
  private logger: pino.Logger

  constructor(logger: pino.Logger) {
    const activeStrategy = process.env["ACTIVE_STRATEGY"]
    const walletType = process.env["ACTIVE_WALLET"]
    if (!activeStrategy) {
      throw new Error(`Missing dealer active strategy environment variable`)
    } else if (!walletType) {
      throw new Error(`Missing dealer wallet type environment variable`)
    }
    this.wallet = createDealerWallet(walletType as WalletType, logger)
    this.strategy = createHedgingStrategy(activeStrategy as HedgingStrategies, logger)
    this.database = new InFlightTransferDb(logger)

    this.logger = logger.child({ topic: "dealer" })
  }

  private async updateInFlightTransfer(): Promise<Result<void>> {
    const logger = this.logger.child({ method: "updateInFlightTransfer()" })

    // Check and Update persisted in-flight fund transfer
    let result = this.database.getPendingInFlightTransfers(
      InFlightTransferDirection.DEPOSIT_ON_EXCHANGE,
    )
    if (result.ok && result.value.size !== 0) {
      // Check if the funds arrived
      const transfers = result.value
      transfers.forEach(async (transfer, address) => {
        const result = await this.strategy.isDepositCompleted(
          address,
          transfer.transferSizeInSats,
        )
        if (result.ok && result.value) {
          const result = this.database.completedInFlightTransfers(address)
          if (!result.ok) {
            const message = "Failed to update database on completed deposit to exchange"
            logger.debug({ result, transfer }, message)
          }
        }
      })
    }

    result = this.database.getPendingInFlightTransfers(
      InFlightTransferDirection.WITHDRAW_TO_WALLET,
    )
    if (result.ok && result.value.size !== 0) {
      // Check if the funds arrived
      const transfers = result.value
      transfers.forEach(async (transfer, address) => {
        const result = await this.strategy.isWithdrawalCompleted(
          address,
          transfer.transferSizeInSats,
        )
        if (result.ok && result.value) {
          const result = this.database.completedInFlightTransfers(address)
          if (!result.ok) {
            const message =
              "Failed to update database on completed withdrawal from exchange"
            logger.debug({ result, transfer }, message)
          }
        }
      })
    }

    return { ok: true, value: undefined }
  }

  public async updatePositionAndLeverage(): Promise<
    Result<UpdatedPositionAndLeverageResult>
  > {
    const logger = this.logger.child({ method: "updatePositionAndLeverage()" })

    const updateResult = await this.updateInFlightTransfer()
    if (!updateResult.ok) {
      logger.error(
        { error: updateResult.error },
        "Error while updating in-flight fund transfer.",
      )
      return updateResult
    }

    const priceResult = await this.strategy.getBtcSpotPriceInUsd()
    if (!priceResult.ok) {
      logger.error({ error: priceResult.error }, "Cannot get BTC spot price.")
      return { ok: false, error: priceResult.error }
    }
    const btcPriceInUsd = priceResult.value
    const usdLiabilityResult = await this.wallet.getWalletUsdBalance()

    // If liability is negative, treat as an asset and do not hedge
    // If liability is below threshold, do not hedge
    if (!usdLiabilityResult.ok || Number.isNaN(usdLiabilityResult.value)) {
      const message = "Liabilities is unavailable or NaN."
      logger.debug({ usdLiabilityResult }, message)
      return { ok: false, error: new Error(message) }
    }

    // Wallet usd balance is negative if actual liability,
    // return additive inverse to deal with positive liability onward
    const usdLiability = -usdLiabilityResult.value

    const result = {} as UpdatedPositionAndLeverageResult

    if (usdLiability < MINIMUM_POSITIVE_LIABILITY) {
      logger.debug({ usdLiability }, "No liabilities to hedge, skipping the order loop")
      result.updatePositionSkipped = true
    } else {
      logger.debug("starting with order loop")

      const updatedPositionResult = await this.strategy.updatePosition(
        usdLiability,
        btcPriceInUsd,
      )
      result.updatedPositionResult = updatedPositionResult
      if (updatedPositionResult.ok) {
        const originalPosition = updatedPositionResult.value.originalPosition
        const updatedPosition = updatedPositionResult.value.updatedPosition

        logger.info(
          { activeStrategy: this.strategy.name, originalPosition, updatedPosition },
          "The {activeStrategy} was successful at UpdatePosition()",
        )
        logger.debug(
          { activeStrategy: this.strategy.name, originalPosition },
          "Position BEFORE {activeStrategy} executed UpdatePosition()",
        )
        logger.debug(
          { activeStrategy: this.strategy.name, updatedPosition },
          "Position AFTER {activeStrategy} executed UpdatePosition()",
        )
      } else {
        logger.error(
          { activeStrategy: this.strategy.name, updatedPosition: updatedPositionResult },
          "The {activeStrategy} failed during the UpdatePosition() execution",
        )
      }
    }

    // Check for any in-flight fund transfer, and skip if not all completed
    const dbCallResult = this.database.getPendingInFlightTransfers()
    if (dbCallResult.ok && dbCallResult.value.size === 0) {
      logger.debug("starting with rebalance loop")

      const withdrawOnChainAddressResult =
        await this.wallet.getWalletOnChainDepositAddress()
      if (!withdrawOnChainAddressResult.ok || !withdrawOnChainAddressResult.value) {
        const message = "WalletOnChainAddress is unavailable or invalid."
        logger.debug({ withdrawOnChainAddressResult }, message)
        return { ok: false, error: new Error(message) }
      }
      const withdrawOnChainAddress = withdrawOnChainAddressResult.value

      const updatedLeverageResult = await this.strategy.updateLeverage(
        usdLiability,
        btcPriceInUsd,
        withdrawOnChainAddress,
        this.withdrawBookKeeping,
        this.depositOnExchangeCallback,
      )
      result.updatedLeverageResult = updatedLeverageResult
      if (updatedLeverageResult.ok) {
        const updatedLeverage = updatedLeverageResult.value
        logger.info(
          { activeStrategy: this.strategy.name, updatedLeverage },
          "The active {activeStrategy} was successful at UpdateLeverage()",
        )
      } else {
        logger.error(
          { activeStrategy: this.strategy.name, updatedLeverageResult },
          "The active {activeStrategy} failed during the UpdateLeverage() execution",
        )
      }
    } else {
      result.updatedLeverageSkipped = true
      if (dbCallResult.ok) {
        const pendingInFlightTransfers = dbCallResult.value
        const message =
          "Some funds are in-flight, skipping the rebalance until settlement"
        logger.debug({ pendingInFlightTransfers }, message)
      } else {
        const message = "Error getting in-flight fund transfer data"
        logger.error({ dbCallResult }, message)
      }
    }

    if (
      (result.updatePositionSkipped || result.updatedPositionResult.ok) &&
      (result.updatedLeverageSkipped || result.updatedLeverageResult.ok)
    ) {
      return { ok: true, value: result }
    } else {
      return { ok: false, error: new Error() }
    }
  }

  private async depositOnExchangeCallback(
    onChainAddress: string,
    transferSizeInBtc: number,
  ): Promise<Result<void>> {
    try {
      const memo = `deposit of ${transferSizeInBtc} btc to ${this.strategy.name}`
      const transferSizeInSats = btc2sat(transferSizeInBtc)
      const payOnChainResult = await this.wallet.payOnChain(
        onChainAddress,
        transferSizeInSats,
        memo,
      )

      if (payOnChainResult.ok) {
        // Persist in-flight fund transfer in database until completed
        const transfer = new InFlightTransfer(
          InFlightTransferDirection.DEPOSIT_ON_EXCHANGE,
          onChainAddress,
          transferSizeInSats,
          memo,
        )
        const result = this.database.insertInFlightTransfers(transfer)
        this.logger.debug(
          { result, transfer },
          "Insert in-flight fund transfer in database.",
        )
        if (!result.ok) {
          this.logger.error(
            { result },
            "Error while inserting in-flight fund transfer in database.",
          )
          return result
        }

        return { ok: true, value: undefined }
      } else {
        this.logger.debug({ payOnChainResult }, "WalletOnChainPay failed.")
        return { ok: false, error: payOnChainResult.error }
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  private async withdrawBookKeeping(
    onChainAddress,
    transferSizeInBtc: number,
  ): Promise<Result<void>> {
    try {
      const memo = `withdrawal of ${transferSizeInBtc} btc from ${this.strategy.name}`
      const transferSizeInSats = btc2sat(transferSizeInBtc)
      this.logger.info({ transferSizeInSats, memo }, "withdrawBookKeeping")

      // Persist in-flight fund transfer in database until completed
      const transfer = new InFlightTransfer(
        InFlightTransferDirection.WITHDRAW_TO_WALLET,
        onChainAddress,
        transferSizeInSats,
        memo,
      )
      const result = this.database.insertInFlightTransfers(transfer)
      this.logger.debug(
        { result, transfer },
        "Insert in-flight fund transfer in database.",
      )
      if (!result.ok) {
        this.logger.error(
          { result },
          "Error while inserting in-flight fund transfer in database.",
        )
        return result
      }

      return { ok: true, value: undefined }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  public async getSpotPriceInUsd(): Promise<number> {
    const result = await this.strategy.getSpotPriceInUsd()
    if (!result.ok) {
      return NaN
    }
    return result.value
  }

  public async getDerivativePriceInUsd(): Promise<number> {
    const result = await this.strategy.getDerivativePriceInUsd()
    if (!result.ok) {
      return NaN
    }
    return result.value
  }

  public async getNextFundingRateInBtc(): Promise<number> {
    const result = await this.strategy.getNextFundingRateInBtc()
    if (!result.ok) {
      return NaN
    }
    return result.value
  }

  public async getAccountAndPositionRisk(): Promise<
    Result<GetAccountAndPositionRiskResult>
  > {
    return this.strategy.getAccountAndPositionRisk()
  }

  public async getLiabilityInUsd(): Promise<number> {
    const result = await this.wallet.getWalletUsdBalance()
    if (!result.ok) {
      return NaN
    }
    return result.value
  }
}
