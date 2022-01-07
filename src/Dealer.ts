import pino from "pino"
import { yamlConfig } from "./config"
import { Result } from "./Result"
import { btc2sat } from "./utils"
import {
  HedgingStrategies,
  HedgingStrategy,
  UpdatedBalance,
  UpdatedPosition,
} from "./HedgingStrategyTypes"
import { InFlightTransfer, Transaction } from "./database/models"
import { db as database } from "./database"

import { GaloyWallet } from "./GaloyWalletTypes"
import { createDealerWallet, WalletType } from "./DealerWalletFactory"
import { createHedgingStrategy } from "./HedgingStrategyFactory"
import {
  GetAccountAndPositionRiskResult,
  GetTransactionHistoryParameters,
} from "./ExchangeTradingType"

const hedgingBounds = yamlConfig.hedging

export type UpdatedPositionAndLeverageResult = {
  updatePositionSkipped: boolean
  updatedPositionResult: Result<UpdatedPosition>
  updateLeverageSkipped: boolean
  updatedLeverageResult: Result<UpdatedBalance>
}

export class Dealer {
  private wallet: GaloyWallet
  private strategy: HedgingStrategy
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

    this.logger = logger.child({ topic: "dealer" })
  }

  private async updateInFlightTransfer(): Promise<Result<void>> {
    const logger = this.logger.child({ method: "updateInFlightTransfer()" })

    // Check and Update persisted in-flight fund transfer
    let result = await database.inFlightTransfers.getPendingDeposit()
    logger.debug({ result }, "database.getPendingDeposit() returned: {result}")
    if (result.ok && result.value.size !== 0) {
      // Check if the funds arrived
      const transfersMap = result.value

      for (const [address, transfers] of transfersMap) {
        for (const transfer of transfers) {
          const result = await this.strategy.isDepositCompleted(
            address,
            transfer.transferSizeInSats,
          )
          logger.debug(
            { address, transfer, result },
            "strategy.isDepositCompleted({address}, {transferSizeInSats}) returned: {result}",
          )
          if (result.ok && result.value) {
            const result = await database.inFlightTransfers.completed(address)
            logger.debug(
              { address, result },
              "database.completedInFlightTransfer({address}) returned: {result}",
            )
            if (!result.ok) {
              const message = "Failed to update database on completed deposit to exchange"
              logger.debug({ result, transfer }, message)
            }
          }
        }
      }
    }

    result = await database.inFlightTransfers.getPendingWithdraw()
    logger.debug({ result }, "database.getPendingWithdraw() returned: {result}")
    if (result.ok && result.value.size !== 0) {
      // Check if the funds arrived
      const transfersMap = result.value
      for (const [address, transfers] of transfersMap) {
        for (const transfer of transfers) {
          const result = await this.strategy.isWithdrawalCompleted(
            address,
            transfer.transferSizeInSats,
          )
          logger.debug(
            { address, transfer, result },
            "strategy.isWithdrawalCompleted({address}, {transferSizeInSats}) returned: {result}",
          )
          if (result.ok && result.value) {
            const result = await database.inFlightTransfers.completed(address)
            logger.debug(
              { address, result },
              "database.completedInFlightTransfer({address}) returned: {result}",
            )
            if (!result.ok) {
              const message =
                "Failed to update database on completed withdrawal from exchange"
              logger.debug({ result, transfer }, message)
            }
          }
        }
      }
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
    logger.debug(
      { usdLiabilityResult },
      "wallet.getWalletUsdBalance() returned: {usdLiabilityResult}",
    )

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

    if (usdLiability < hedgingBounds.MINIMUM_POSITIVE_LIABILITY_USD) {
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
          {
            usdLiability,
            btcPriceInUsd,
            activeStrategy: this.strategy.name,
            originalPosition,
            updatedPosition,
          },
          "The {activeStrategy} was successful at UpdatePosition({usdLiability}, {btcPriceInUsd})",
        )
      } else {
        logger.error(
          {
            usdLiability,
            btcPriceInUsd,
            activeStrategy: this.strategy.name,
            updatedPosition: updatedPositionResult,
          },
          "The {activeStrategy} failed during the UpdatePosition({usdLiability}, {btcPriceInUsd}) execution",
        )
      }
    }

    // Check for any in-flight fund transfer, and skip if not all completed
    const dbCallResult = await database.inFlightTransfers.getPendingCount()
    if (dbCallResult.ok && dbCallResult.value === 0) {
      logger.debug("starting with rebalance loop")

      const withdrawOnChainAddressResult =
        await this.wallet.getWalletOnChainDepositAddress()
      logger.debug(
        { withdrawOnChainAddressResult },
        "wallet.getWalletOnChainDepositAddress() returned: {withdrawOnChainAddressResult}",
      )
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
        this.withdrawBookKeeping.bind(this),
        this.depositOnExchangeCallback.bind(this),
      )
      result.updatedLeverageResult = updatedLeverageResult
      if (updatedLeverageResult.ok) {
        const updatedLeverage = updatedLeverageResult.value
        logger.info(
          {
            usdLiability,
            btcPriceInUsd,
            withdrawOnChainAddress,
            activeStrategy: this.strategy.name,
            updatedLeverage,
          },
          "The active {activeStrategy} was successful at UpdateLeverage({usdLiability}, {exposureInUsd}, {btcPriceInUsd}, {withdrawOnChainAddress})",
        )
      } else {
        logger.error(
          {
            usdLiability,
            btcPriceInUsd,
            withdrawOnChainAddress,
            activeStrategy: this.strategy.name,
            updatedLeverageResult,
          },
          "The active {activeStrategy} failed during the UpdateLeverage({usdLiability}, {exposureInUsd}, {btcPriceInUsd}, {withdrawOnChainAddress}) execution",
        )
      }
    } else {
      result.updateLeverageSkipped = true
      if (dbCallResult.ok) {
        const pending = dbCallResult.value
        const message =
          "Some funds are in-flight, skipping the rebalance until settlement"
        logger.debug({ pending }, message)
      } else {
        const message = "Error getting in-flight fund transfer data"
        logger.error({ dbCallResult }, message)
      }
    }

    if (
      (result.updatePositionSkipped || result.updatedPositionResult.ok) &&
      (result.updateLeverageSkipped || result.updatedLeverageResult.ok)
    ) {
      return { ok: true, value: result }
    } else {
      const errors: Error[] = []
      if (!result.updatePositionSkipped && !result.updatedPositionResult.ok) {
        errors.push(result.updatedPositionResult.error)
        return { ok: false, error: result.updatedPositionResult.error }
      } else if (!result.updateLeverageSkipped && !result.updatedLeverageResult.ok) {
        errors.push(result.updatedLeverageResult.error)
        return { ok: false, error: result.updatedLeverageResult.error }
      } else {
        return {
          ok: false,
          error: new Error(`Unknown error: ${errors}`),
        }
      }
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
      this.logger.debug(
        { payOnChainResult },
        "WalletOnChainPay returned: {payOnChainResult}",
      )

      if (payOnChainResult.ok) {
        // Persist in-flight fund transfer in database until completed
        const transfer: InFlightTransfer = {
          isDepositOnExchange: true,
          address: onChainAddress,
          transferSizeInSats,
          memo,
          isCompleted: false,
        }
        const result = await database.inFlightTransfers.insert(transfer)
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
      const transfer: InFlightTransfer = {
        isDepositOnExchange: false,
        address: onChainAddress,
        transferSizeInSats,
        memo,
        isCompleted: false,
      }
      const result = await database.inFlightTransfers.insert(transfer)
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

  public async getMarkPriceInUsd(): Promise<number> {
    const result = await this.strategy.getMarkPriceInUsd()
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

  private async fetchTransactionHistory(
    args: GetTransactionHistoryParameters,
  ): Promise<Transaction[]> {
    const result = await this.strategy.fetchTransactionHistory(args)
    if (!result.ok) {
      return []
    }
    return result.value
  }

  public async fetchAndLoadTransactions() {
    // get latest id we saved in db
    let lastBillId = ""
    const result = await database.transactions.getLastBillId()
    if (!result.ok) {
      this.logger.error(
        "Couldn't get last transaction id from database, continuing with blank id...",
      )
    } else if (result.value) {
      lastBillId = result.value
    }

    // fetch and insert transactions since last
    const args: GetTransactionHistoryParameters = {
      beforeTransactionId: lastBillId,
    }
    const transactions = await this.fetchTransactionHistory(args)
    for (const transaction of transactions) {
      await database.transactions.insert(transaction)
    }
  }
}
