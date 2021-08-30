import { roundBtc, sleep } from "./utils"
import { yamlConfig } from "./config"
import { Result } from "./Result"
import {
  TradeSide,
  TradeType,
  FundTransferSide,
  OrderStatus,
  FundTransferStatus,
  GetAccountAndPositionRiskResult,
  TradeCurrency,
} from "./ExchangeTradingType"
import {
  HedgingStrategy,
  UpdatedPosition,
  UpdatedBalance,
  DepositOnExchangeCallback,
  WithdrawBookKeepingCallback,
} from "./HedgingStrategyTypes"
import { ExchangeBase } from "./ExchangeBase"
import { ExchangeConfiguration, SupportedInstrument } from "./ExchangeConfiguration"
import { OkexExchangeConfiguration } from "./OkexExchangeConfiguration"
import { OkexExchange } from "./OkexExchange"
import pino from "pino"

const hedgingBounds = yamlConfig.hedging

export interface GetHedgingOrderResult {
  in: {
    loBracket: number
    exposureRatio: number
    hiBracket: number
  }
  out: {
    tradeSide: TradeSide
    orderSizeInUsd: number
    orderSizeInBtc: number
    btcPriceInUsd: number
  }
}

export interface GetRebalanceTransferResult {
  in: {
    loBracket: number
    leverageRatio: number
    hiBracket: number
  }
  out: {
    fundTransferSide: FundTransferSide
    transferSizeInUsd: number
    transferSizeInBtc: number
    btcPriceInUsd: number
    newLeverageRatio: number
  }
}

export interface GetRiskAndOrderResult {
  risk: GetAccountAndPositionRiskResult
  order: GetHedgingOrderResult
}

export class OkexPerpetualSwapStrategy implements HedgingStrategy {
  private isSimulation: boolean
  exchange: ExchangeBase
  exchangeConfig: ExchangeConfiguration
  instrumentId: SupportedInstrument
  public name = OkexPerpetualSwapStrategy.name
  private logger: pino.Logger

  constructor(logger: pino.Logger) {
    this.isSimulation = !process.env["HEDGING_NOT_IN_SIMULATION"]
    this.exchangeConfig = new OkexExchangeConfiguration()
    this.exchange = new OkexExchange(this.exchangeConfig, logger)
    this.instrumentId = this.exchangeConfig.instrumentId
    this.logger = logger.child({ class: OkexPerpetualSwapStrategy.name })

    if (!this.isSimulation) {
      this.exchange.setAccountConfiguration()
    }
  }

  public async getBtcSpotPriceInUsd(): Promise<Result<number>> {
    const result = await this.exchange.fetchTicker(this.instrumentId)
    if (result.ok) {
      return { ok: true, value: result.value.lastBtcPriceInUsd }
    } else {
      return { ok: false, error: result.error }
    }
  }

  public async getSpotPriceInUsd(): Promise<Result<number>> {
    const result = await this.exchange.getMarketIndexTickers()
    // const result = await this.exchange.fetchTicker(SupportedInstrument.OKEX_BTC_USD_SPOT)
    if (result.ok) {
      return { ok: true, value: result.value.indexPriceInUsd }
    } else {
      return { ok: false, error: result.error }
    }
  }

  public async getDerivativePriceInUsd(): Promise<Result<number>> {
    const result = await this.exchange.getPublicMarkPrice()
    // const result = await this.exchange.fetchTicker(
    //   SupportedInstrument.OKEX_PERPETUAL_SWAP,
    // )
    if (result.ok) {
      return { ok: true, value: result.value.markPriceInUsd }
    } else {
      return { ok: false, error: result.error }
    }
  }

  public async getNextFundingRateInBtc(): Promise<Result<number>> {
    const result = await this.exchange.getPublicFundingRate()
    if (result.ok) {
      return { ok: true, value: Number(result.value.nextFundingRate) }
    } else {
      return { ok: false, error: result.error }
    }
  }

  public async getAccountAndPositionRisk(): Promise<
    Result<GetAccountAndPositionRiskResult>
  > {
    const result = await this.getSpotPriceInUsd()
    if (result.ok) {
      return this.exchange.getAccountAndPositionRisk(result.value)
    } else {
      return { ok: false, error: result.error }
    }
  }

  public async isDepositCompleted(
    address: string,
    amountInSats: number,
  ): Promise<Result<boolean>> {
    const result = await this.exchange.fetchDeposits({ address, amountInSats })
    this.logger.debug(
      { address, amountInSats, result },
      "exchange.fetchDeposits(address, amountInSats) returned: {result}",
    )
    if (!result.ok) {
      return result
    }
    const deposit = result.value
    if (
      deposit.status === FundTransferStatus.Ok ||
      deposit.status === FundTransferStatus.Canceled ||
      deposit.status === FundTransferStatus.Failed
    ) {
      return { ok: true, value: true }
    }

    return { ok: true, value: false }
  }

  public async isWithdrawalCompleted(
    address: string,
    amountInSats: number,
  ): Promise<Result<boolean>> {
    const result = await this.exchange.fetchWithdrawals({ address, amountInSats })
    this.logger.debug(
      { address, amountInSats, deposit: result },
      "exchange.fetchWithdrawals(address, amountInSats) returned: {result}",
    )
    if (!result.ok) {
      return result
    }
    const withdrawal = result.value
    if (
      withdrawal.status === FundTransferStatus.Ok ||
      withdrawal.status === FundTransferStatus.Canceled ||
      withdrawal.status === FundTransferStatus.Failed
    ) {
      return { ok: true, value: true }
    }

    return { ok: true, value: false }
  }

  public async updatePosition(
    liabilityInUsd: number,
    btcPriceInUsd: number,
  ): Promise<Result<UpdatedPosition>> {
    try {
      const updatedPosition = {} as UpdatedPosition
      const logger = this.logger.child({ method: "UpdatePosition()" })

      const riskAndOrderResult = await this.getRiskAndOrder(
        btcPriceInUsd,
        liabilityInUsd,
        hedgingBounds,
      )
      logger.debug(
        { btcPriceInUsd, liabilityInUsd, hedgingBounds, riskAndOrderResult },
        "getRiskAndOrder({btcPriceInUsd}, {liabilityInUsd}, {hedgingBounds}) returned: {riskAndOrderResult}",
      )
      if (!riskAndOrderResult.ok) {
        return { ok: false, error: riskAndOrderResult.error }
      }
      const originalRisk = riskAndOrderResult.value.risk
      const hedgingOrder = riskAndOrderResult.value.order

      updatedPosition.originalPosition = originalRisk

      if (hedgingOrder.out.tradeSide === TradeSide.NoTrade) {
        const msg =
          "{hedgingOrder.in.loBracket} < {hedgingOrder.in.exposureRatio} < {hedgingOrder.in.hiBracket}"
        logger.debug({ hedgingOrder }, `Calculated no hedging is needed: ${msg}`)
        return {
          ok: true,
          value: updatedPosition,
        }
      }

      if (/* hedgingOrder.out.tradeSide !== TradeSide.NoTrade && */ this.isSimulation) {
        logger.debug({ hedgingOrder }, "Calculated a SIMULATED new hedging order")
        return {
          ok: true,
          value: updatedPosition,
        }
      }

      logger.debug({ hedgingOrder }, "Calculated a new hedging order")

      const placedOrderResult = await this.placeHedgingOrder(
        hedgingOrder.out.tradeSide,
        hedgingOrder.out.orderSizeInUsd,
      )
      logger.debug(
        {
          tradeSide: hedgingOrder.out.tradeSide,
          orderSizeInUsd: hedgingOrder.out.orderSizeInUsd,
        },
        "placeHedgingOrder({tradeSide}, {orderSizeInUsd}",
      )
      if (!placedOrderResult.ok) {
        return { ok: false, error: placedOrderResult.error }
      }

      // Check that we don't need another order, i.e. "all is good"
      const confirmRiskAndOrderResult = await this.getRiskAndOrder(
        btcPriceInUsd,
        liabilityInUsd,
        hedgingBounds,
      )
      logger.debug(
        { btcPriceInUsd, liabilityInUsd, hedgingBounds, confirmRiskAndOrderResult },
        "getRiskAndOrder({btcPriceInUsd}, {liabilityInUsd}, {hedgingBounds}) returned: {confirmRiskAndOrderResult}",
      )
      if (!confirmRiskAndOrderResult.ok) {
        return { ok: false, error: confirmRiskAndOrderResult.error }
      }
      const updatedRisk = confirmRiskAndOrderResult.value.risk
      const confirmationOrder = confirmRiskAndOrderResult.value.order

      updatedPosition.updatedPosition = updatedRisk

      // TODO: Need to verify that the confirmOrder is above minimum contract side before concluding to a problem
      if (!this.isSimulation && confirmationOrder.out.tradeSide !== TradeSide.NoTrade) {
        const validateOrderResult = await this.validateConfirmOrder(
          confirmationOrder.out.tradeSide,
          confirmationOrder.out.orderSizeInUsd,
        )
        logger.debug(
          {
            tradeSide: confirmationOrder.out.tradeSide,
            orderSizeInUsd: confirmationOrder.out.orderSizeInUsd,
          },
          "validateConfirmOrder({tradeSide}, {orderSizeInUsd}",
        )
        if (validateOrderResult.ok) {
          return {
            ok: false,
            error: new Error(
              `New hedging order required immediately after one was executed: ${hedgingOrder} vs ${confirmationOrder}`,
            ),
          }
        }
      }

      return {
        ok: true,
        value: updatedPosition,
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  public async updateLeverage(
    liabilityInUsd: number,
    btcPriceInUsd: number,
    withdrawOnChainAddress: string,
    withdrawBookKeepingCallback: WithdrawBookKeepingCallback,
    depositOnExchangeCallback: DepositOnExchangeCallback,
  ): Promise<Result<UpdatedBalance>> {
    try {
      const updatedBalance = {} as UpdatedBalance
      const riskResult = await this.exchange.getAccountAndPositionRisk(btcPriceInUsd)
      this.logger.debug(
        { btcPriceInUsd, riskResult },
        "getAccountAndPositionRisk({btcPriceInUsd}) returned: {riskResult}",
      )
      if (!riskResult.ok) {
        return { ok: false, error: riskResult.error }
      }
      const risk = riskResult.value
      const collateralInUsd = risk.collateralInUsd
      const lastBtcPriceInUsd = risk.lastBtcPriceInUsd

      const rebalanceResult = OkexPerpetualSwapStrategy.getRebalanceTransferIfNeeded(
        liabilityInUsd,
        collateralInUsd,
        lastBtcPriceInUsd,
        hedgingBounds,
      )
      this.logger.debug(
        {
          liabilityInUsd,
          collateralInUsd,
          lastBtcPriceInUsd,
          hedgingBounds,
          rebalanceResult,
        },
        "getRebalanceTransferIfNeeded() returned: {rebalanceResult}",
      )
      if (!rebalanceResult.ok) {
        return { ok: false, error: rebalanceResult.error }
      }
      const fundTransferSide = rebalanceResult.value.out.fundTransferSide
      const transferSizeInBtc = rebalanceResult.value.out.transferSizeInBtc

      updatedBalance.liabilityInUsd = liabilityInUsd
      updatedBalance.collateralInUsd = collateralInUsd
      updatedBalance.originalLeverageRatio = rebalanceResult.value.in.leverageRatio
      updatedBalance.newLeverageRatio = rebalanceResult.value.out.newLeverageRatio

      if (this.isSimulation) {
        this.logger.debug(
          { fundTransferSide, transferSizeInBtc, withdrawOnChainAddress },
          "Calculated a SIMULATED rebalance transfer",
        )
      } else if (fundTransferSide === FundTransferSide.NoTransfer) {
        this.logger.debug(
          { fundTransferSide, transferSizeInBtc, withdrawOnChainAddress },
          "Calculated NO rebalance transfer needed",
        )
      } else if (fundTransferSide === FundTransferSide.Withdraw) {
        const withdrawArgs = {
          currency: TradeCurrency.BTC,
          quantity: transferSizeInBtc,
          address: withdrawOnChainAddress,
        }
        const withdrawalResult = await this.exchange.withdraw(withdrawArgs)
        this.logger.debug(
          { withdrawArgs, withdrawalResult },
          "withdraw() returned: {withdrawalResult}",
        )
        if (!withdrawalResult.ok) {
          return { ok: false, error: withdrawalResult.error }
        }
        const withdrawalResponse = withdrawalResult.value

        if (withdrawalResponse.id) {
          const bookingResult = await withdrawBookKeepingCallback(
            withdrawOnChainAddress,
            transferSizeInBtc,
          )
          this.logger.debug(
            { transferSizeInBtc, bookingResult },
            "withdrawBookKeepingCallback() returned: {depositResult}",
          )
          if (!bookingResult.ok) {
            return { ok: false, error: bookingResult.error }
          }

          this.logger.info(
            { withdrawalResponse },
            "rebalancing withdrawal was successful",
          )
        } else {
          this.logger.error(
            { withdrawalResponse },
            "rebalancing withdrawal was NOT successful",
          )
        }
      } else if (fundTransferSide === FundTransferSide.Deposit) {
        const memo = `deposit of ${transferSizeInBtc} btc to ${this.exchange.exchangeId}`

        const fetchResult = await this.exchange.fetchDepositAddress(TradeCurrency.BTC)
        this.logger.debug(
          { fetchResult },
          "fetchDepositAddress() returned: {fetchResult}",
        )
        if (!fetchResult.ok) {
          return { ok: false, error: fetchResult.error }
        }
        const exchangeDepositOnChainAddress = fetchResult.value.address

        const depositResult = await depositOnExchangeCallback(
          exchangeDepositOnChainAddress,
          transferSizeInBtc,
        )
        this.logger.debug(
          { exchangeDepositOnChainAddress, transferSizeInBtc, depositResult },
          "depositOnExchangeCallback() returned: {depositResult}",
        )
        if (!depositResult.ok) {
          return { ok: false, error: depositResult.error }
        }
        this.logger.info(
          { memo, exchangeDepositOnChainAddress },
          "deposit rebalancing successful",
        )
      }

      return {
        ok: true,
        value: updatedBalance,
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  static getHedgingOrderIfNeeded(
    liabilityInUsd: number,
    exposureInUsd: number,
    btcPriceInUsd: number,
    hedgingBounds,
  ): Result<GetHedgingOrderResult> {
    try {
      let orderSizeInUsd = 0
      let tradeSide: TradeSide = TradeSide.NoTrade
      const exposureRatio = exposureInUsd / liabilityInUsd

      if (exposureRatio < hedgingBounds.LOW_BOUND_RATIO_SHORTING) {
        const newExposureInUsd =
          liabilityInUsd * hedgingBounds.LOW_SAFEBOUND_RATIO_SHORTING
        orderSizeInUsd = newExposureInUsd - exposureInUsd
        tradeSide = TradeSide.Sell
      } else if (exposureRatio > hedgingBounds.HIGH_BOUND_RATIO_SHORTING) {
        const newExposureInUsd =
          liabilityInUsd * hedgingBounds.HIGH_SAFEBOUND_RATIO_SHORTING
        orderSizeInUsd = exposureInUsd - newExposureInUsd
        tradeSide = TradeSide.Buy
      }

      const orderSizeInBtc = roundBtc(orderSizeInUsd / btcPriceInUsd)
      return {
        ok: true,
        value: {
          in: {
            loBracket: hedgingBounds.LOW_BOUND_RATIO_SHORTING,
            exposureRatio,
            hiBracket: hedgingBounds.HIGH_BOUND_RATIO_SHORTING,
          },
          out: {
            tradeSide,
            orderSizeInUsd,
            orderSizeInBtc,
            btcPriceInUsd,
          },
        },
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  async getRiskAndOrder(
    btcPriceInUsd: number,
    liabilityInUsd: number,
    hedgingBounds,
  ): Promise<Result<GetRiskAndOrderResult>> {
    try {
      const riskResult = await this.exchange.getAccountAndPositionRisk(btcPriceInUsd)
      this.logger.debug(
        { btcPriceInUsd, riskResult },
        "getAccountAndPositionRisk({btcPriceInUsd}) returned: {riskResult}",
      )
      if (!riskResult.ok) {
        return { ok: false, error: riskResult.error }
      }
      const risk = riskResult.value
      const lastBtcPriceInUsd = risk.lastBtcPriceInUsd
      const exposureInUsd = risk.exposureInUsd

      const orderResult = OkexPerpetualSwapStrategy.getHedgingOrderIfNeeded(
        liabilityInUsd,
        exposureInUsd,
        lastBtcPriceInUsd,
        hedgingBounds,
      )
      this.logger.debug(
        { liabilityInUsd, exposureInUsd, lastBtcPriceInUsd, hedgingBounds, orderResult },
        "getHedgingOrderIfNeeded({liabilityInUsd}, {exposureInUsd}, {lastBtcPriceInUsd}, {hedgingBounds}) returned: {orderResult}",
      )
      if (!orderResult.ok) {
        return { ok: false, error: orderResult.error }
      }
      const order = orderResult.value

      return {
        ok: true,
        value: { risk, order },
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  async validateConfirmOrder(
    tradeSide: TradeSide,
    btcPriceInUsd: number,
  ): Promise<Result<void>> {
    const logger = this.logger.child({ method: "validateConfirmOrder()" })

    try {
      const result = await this.exchange.getInstrumentDetails()
      logger.debug({ result }, "getInstrumentDetails() returned: {result}")
      if (!result.ok) {
        return { ok: false, error: result.error }
      }
      const contractDetail = result.value

      const minOrderSizeInContract = contractDetail.minimumOrderSizeInContract
      const contractFaceValue = contractDetail.contractFaceValue
      const orderSizeInContract = Math.round(btcPriceInUsd / contractFaceValue)

      if (orderSizeInContract < minOrderSizeInContract) {
        const msg = `Order size (${orderSizeInContract}) is smaller than minimum (${minOrderSizeInContract}). Cannot place order`
        logger.warn(msg)
        return { ok: false, error: new Error(msg) }
      }

      return { ok: true, value: undefined }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  async placeHedgingOrder(
    tradeSide: TradeSide,
    btcPriceInUsd: number,
  ): Promise<Result<void>> {
    const logger = this.logger.child({ method: "placeHedgingOrder()" })

    try {
      const result = await this.exchange.getInstrumentDetails()
      logger.debug({ result }, "getInstrumentDetails() returned: {result}")
      if (!result.ok) {
        return { ok: false, error: result.error }
      }
      const contractDetail = result.value

      const minOrderSizeInContract = contractDetail.minimumOrderSizeInContract
      const contractFaceValue = contractDetail.contractFaceValue
      const orderSizeInContract = Math.round(btcPriceInUsd / contractFaceValue)

      if (orderSizeInContract < minOrderSizeInContract) {
        const msg = `Order size (${orderSizeInContract}) is smaller than minimum (${minOrderSizeInContract}). Cannot place order`
        logger.warn(msg)
        return { ok: false, error: new Error(msg) }
      }

      const orderResult = await this.exchange.createMarketOrder({
        instrumentId: this.instrumentId,
        type: TradeType.Market,
        side: tradeSide,
        quantity: orderSizeInContract,
      })
      logger.debug(
        { instrumentId: this.instrumentId, tradeSide, orderSizeInContract, orderResult },
        "this.exchange.createMarketOrder({instrumentId}, {tradeSide}, {orderSizeInContract}) returned: {orderResult}",
      )
      if (!orderResult.ok) {
        return { ok: false, error: orderResult.error }
      }
      const placedOrder = orderResult.value

      const waitTimeInMs = 1000
      const maxWaitCycleCount = 30
      let iteration = 0
      let fetchedOrder

      do {
        await sleep(waitTimeInMs)
        const fetchedOrderResult = await this.exchange.fetchOrder(placedOrder.id)
        logger.debug(
          { placedOrder, fetchedOrderResult },
          "this.exchange.fetchOrder({placedOrder.id}) returned: {fetchedOrderResult}",
        )
        if (!fetchedOrderResult.ok) {
          return { ok: false, error: fetchedOrderResult.error }
        }
        fetchedOrder = fetchedOrderResult.value
      } while (
        ++iteration < maxWaitCycleCount &&
        fetchedOrder &&
        fetchedOrder.status === OrderStatus.Open
      )

      if (fetchedOrder.status === OrderStatus.Closed) {
        logger.info("Order has been executed successfully.")
        return { ok: true, value: undefined }
      } else if (fetchedOrder.status === OrderStatus.Canceled) {
        const msg = "Order has been cancelled."
        logger.error(msg)
        return { ok: false, error: new Error(msg) }
      } else {
        const msg = "Order has not been executed yet."
        logger.error(msg)
        return { ok: false, error: new Error(msg) }
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  static getRebalanceTransferIfNeeded(
    liabilityInUsd: number,
    collateralInUsd: number,
    btcPriceInUsd: number,
    hedgingBounds,
  ): Result<GetRebalanceTransferResult> {
    try {
      const leverageRatio = liabilityInUsd / collateralInUsd
      const result: GetRebalanceTransferResult = {
        in: {
          loBracket: hedgingBounds.LOW_BOUND_LEVERAGE,
          leverageRatio,
          hiBracket: hedgingBounds.HIGH_BOUND_LEVERAGE,
        },
        out: {
          fundTransferSide: FundTransferSide.NoTransfer,
          transferSizeInUsd: 0,
          transferSizeInBtc: 0,
          btcPriceInUsd,
          newLeverageRatio: leverageRatio,
        },
      }

      if (leverageRatio < hedgingBounds.LOW_BOUND_LEVERAGE) {
        const newCollateralInUsd = liabilityInUsd / hedgingBounds.LOW_SAFEBOUND_LEVERAGE
        const transferSizeInUsd = collateralInUsd - newCollateralInUsd
        if (transferSizeInUsd > hedgingBounds.MINIMUM_TRANSFER_AMOUNT_USD) {
          result.out.transferSizeInUsd = transferSizeInUsd
          result.out.fundTransferSide = FundTransferSide.Withdraw
          result.out.newLeverageRatio = liabilityInUsd / newCollateralInUsd
          result.out.transferSizeInBtc = roundBtc(
            result.out.transferSizeInUsd / btcPriceInUsd,
          )
        }
      } else if (leverageRatio > hedgingBounds.HIGH_BOUND_LEVERAGE) {
        const newCollateralInUsd = liabilityInUsd / hedgingBounds.HIGH_SAFEBOUND_LEVERAGE
        const transferSizeInUsd = newCollateralInUsd - collateralInUsd
        if (transferSizeInUsd > hedgingBounds.MINIMUM_TRANSFER_AMOUNT_USD) {
          result.out.transferSizeInUsd = transferSizeInUsd
          result.out.fundTransferSide = FundTransferSide.Deposit
          result.out.newLeverageRatio = liabilityInUsd / newCollateralInUsd
          result.out.transferSizeInBtc = roundBtc(
            result.out.transferSizeInUsd / btcPriceInUsd,
          )
        }
      }

      return {
        ok: true,
        value: result,
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }
}
