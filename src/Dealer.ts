import { Result } from "./Result"
import { btc2sat } from "./utils"
import {
  HedgingStrategies,
  HedgingStrategy,
  UpdatedBalance,
  UpdatedPosition,
} from "./HedgingStrategyTypes"
import { DealerMockWallet } from "./DealerMockWallet"
import { createHedgingStrategy } from "./HedgingStrategyFactory"
import { InFlightTransfer, InFlightTransferStatus } from "./InFlightTransfer"

// const activeStrategy = HedgingStrategies.FtxPerpetualSwap
const activeStrategy = HedgingStrategies.OkexPerpetualSwap

const MINIMUM_POSITIVE_LIABILITY = 1

export type UpdatedPositionAndLeverageResult = {
  updatePositionSkipped: boolean
  updatedPositionResult: Result<UpdatedPosition>
  updatedLeverageResult: Result<UpdatedBalance>
}

export class Dealer {
  wallet: DealerMockWallet
  strategy: HedgingStrategy
  logger

  constructor(logger) {
    this.wallet = new DealerMockWallet(logger)
    this.strategy = createHedgingStrategy(activeStrategy, logger)
    this.logger = logger.child({ topic: "dealer" })
  }

  async updatePositionAndLeverage(): Promise<Result<UpdatedPositionAndLeverageResult>> {
    const logger = this.logger.child({ method: "updatePositionAndLeverage()" })

    // Check and update saved payment in-flight info

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
          { originalPosition, updatedPosition },
          `The active ${activeStrategy} strategy was successful at UpdatePosition()`,
        )
        logger.debug(
          { originalPosition },
          `Position BEFORE ${activeStrategy} strategy executed UpdatePosition()`,
        )
        logger.debug(
          { updatedPosition },
          `Position AFTER ${activeStrategy} strategy executed UpdatePosition()`,
        )
      } else {
        logger.error(
          { updatedPosition: updatedPositionResult },
          `The active ${activeStrategy} strategy failed during the UpdatePosition() execution`,
        )
      }
    }

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
        { updatedLeverage },
        `The active ${activeStrategy} strategy was successful at UpdateLeverage()`,
      )
    } else {
      logger.error(
        { updatedLeverageResult },
        `The active ${activeStrategy} strategy failed during the UpdateLeverage() execution`,
      )
    }

    if (
      (result.updatePositionSkipped || result.updatedPositionResult.ok) &&
      result.updatedLeverageResult.ok
    ) {
      return { ok: true, value: result }
    } else {
      return { ok: false, error: new Error() }
    }
  }

  async depositOnExchangeCallback(
    onChainAddress,
    transferSizeInBtc: number,
  ): Promise<Result<void>> {
    try {
      const memo = `deposit of ${transferSizeInBtc} btc to ${activeStrategy}`
      const transferSizeInSats = btc2sat(transferSizeInBtc)
      const payOnChainResult = await this.wallet.payOnChain(
        onChainAddress,
        transferSizeInSats,
        memo,
      )

      if (payOnChainResult.ok) {
        // Save payment in-flight info
        const transfer = new InFlightTransfer(
          onChainAddress,
          transferSizeInSats,
          memo,
          InFlightTransferStatus.PENDING,
          this.logger,
        )
        transfer.save()

        return { ok: true, value: undefined }
      } else {
        this.logger.debug({ payOnChainResult }, "WalletOnChainPay failed.")
        return { ok: false, error: payOnChainResult.error }
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  async withdrawBookKeeping(transferSizeInBtc: number): Promise<Result<void>> {
    try {
      const memo = `withdrawal of ${transferSizeInBtc} btc from ${activeStrategy}`
      const transferSizeInSats = btc2sat(transferSizeInBtc)
      this.logger.info({ transferSizeInSats, memo }, "withdrawBookKeeping")

      // Save payment in-flight info

      return { ok: true, value: undefined }
    } catch (error) {
      return { ok: false, error: error }
    }
  }
}
