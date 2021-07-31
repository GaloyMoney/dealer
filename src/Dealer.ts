import { Result } from "./Result"
import { btc2sat } from "./utils"
import { HedgingStrategies, HedgingStrategy } from "./HedgingStrategyTypes"
import { DealerMockWallet } from "./DealerMockWallet"
import { createHedgingStrategy } from "./HedgingStrategyFactory"

// const activeStrategy = HedgingStrategies.FtxPerpetualSwap
const activeStrategy = HedgingStrategies.OkexPerpetualSwap

const MINIMUM_POSITIVE_LIABILITY = 1

export class Dealer {
  wallet: DealerMockWallet
  strategy: HedgingStrategy
  logger

  constructor(logger) {
    this.wallet = new DealerMockWallet(logger)
    this.strategy = createHedgingStrategy(activeStrategy, logger)
    this.logger = logger.child({ topic: "dealer" })
  }

  async getUsdLiability(): Promise<number> {
    const result = await this.wallet.getWalletUsdBalance()
    if (!result.ok) {
      return NaN
    }
    // Wallet usd balance is negative if actual liability,
    // return additive inverse to deal with positive liability onward
    const usdLiability = -result.value
    return usdLiability
  }

  async getWalletOnChainAddress(): Promise<string> {
    const result = await this.wallet.getWalletOnChainDepositAddress()
    if (!result.ok) {
      return ""
    }
    return result.value
  }

  async onChainPay({ address, btcAmountInSats, memo }): Promise<boolean> {
    const result = await this.wallet.payOnChain(address, btcAmountInSats, memo)
    return result.ok
  }

  async updatePositionAndLeverage() {
    const logger = this.logger.child({ method: "updatePositionAndLeverage()" })
    const priceResult = await this.strategy.getBtcSpotPriceInUsd()
    if (!priceResult.ok) {
      logger.error({ error: priceResult.error }, "Cannot get BTC spot price.")
      return
    }
    const btcPriceInUsd = priceResult.value
    const usdLiability = await this.getUsdLiability()

    // If liability is negative, treat as an asset and do not hedge
    // If liability is below threshold, do not hedge
    if (usdLiability < MINIMUM_POSITIVE_LIABILITY) {
      logger.debug({ usdLiability }, "No liabilities to hedge.")
      return
    }

    logger.debug("starting with order loop")

    const updatedPosition = await this.strategy.updatePosition(
      usdLiability,
      btcPriceInUsd,
    )
    if (updatedPosition.ok) {
      const originalPosition = updatedPosition.value.originalPosition
      const newPosition = updatedPosition.value.newPosition

      logger.info(
        `The active ${activeStrategy} strategy was successful at UpdatePosition()`,
      )
      logger.debug(
        { originalPosition },
        `Position BEFORE ${activeStrategy} strategy executed UpdatePosition()`,
      )
      logger.debug(
        { newPosition },
        `Position AFTER ${activeStrategy} strategy executed UpdatePosition()`,
      )
    } else {
      logger.error(
        { updatedPosition },
        `The active ${activeStrategy} strategy failed during the UpdatePosition() execution`,
      )
    }

    logger.debug("starting with rebalance loop")

    const withdrawOnChainAddress = await this.getWalletOnChainAddress()

    const updatedLeverageResult = await this.strategy.updateLeverage(
      usdLiability,
      btcPriceInUsd,
      withdrawOnChainAddress,
      this.withdrawBookKeeping,
      this.depositOnExchangeCallback,
    )
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
  }

  async depositOnExchangeCallback(
    onChainAddress,
    transferSizeInBtc: number,
  ): Promise<Result<void>> {
    try {
      const memo = `deposit of ${transferSizeInBtc} btc to ${activeStrategy}`
      const transferSizeInSats = btc2sat(transferSizeInBtc)
      await this.onChainPay({
        address: onChainAddress,
        btcAmountInSats: transferSizeInSats,
        memo,
      })

      return { ok: true, value: undefined }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  async withdrawBookKeeping(transferSizeInBtc: number): Promise<Result<void>> {
    try {
      const memo = `withdrawal of ${transferSizeInBtc} btc from ${activeStrategy}`
      const transferSizeInSats = btc2sat(transferSizeInBtc)
      this.logger.info({ transferSizeInSats, memo }, "withdrawBookKeeping")

      return { ok: true, value: undefined }
    } catch (error) {
      return { ok: false, error: error }
    }
  }
}
