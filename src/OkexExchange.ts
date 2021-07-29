import {
  GetAccountAndPositionRiskResult,
  GetInstrumentDetailsResult,
  TradeCurrency,
  ApiError,
} from "./ExchangeTradingType"
import assert from "assert"
import { ExchangeBase } from "./ExchangeBase"
import { ExchangeConfiguration } from "./ExchangeConfiguration"
import { Result } from "./Result"

export class OkexExchange extends ExchangeBase {
  instrumentId

  constructor(exchangeConfiguration: ExchangeConfiguration, logger) {
    super(exchangeConfiguration, logger)
    this.instrumentId = exchangeConfiguration.instrumentId
  }

  public async getAccountAndPositionRisk(
    btcPriceInUsd,
  ): Promise<Result<GetAccountAndPositionRiskResult>> {
    try {
      // OKEx has last price as apart of position data, may forgo input validation
      assert(btcPriceInUsd > 0, ApiError.MISSING_PARAMETERS)

      const positionResult = await this.fetchPosition(this.instrumentId)
      this.logger.debug(
        { positionResult },
        `fetchPosition(${this.instrumentId}) returned: {positionResult}`,
      )
      if (!positionResult.ok) {
        return { ok: false, error: positionResult.error }
      }
      const position = positionResult.value

      const lastBtcPriceInUsd = position.last
      const leverageRatio = position.notionalUsd / position.last / position.margin
      const collateralInUsd = position.margin * position.last
      const exposureInUsd = position.notionalUsd

      const balanceResult = await this.fetchBalance()
      this.logger.debug({ balanceResult }, "fetchBalance() returned: {balanceResult}")
      if (!balanceResult.ok) {
        return { ok: false, error: balanceResult.error }
      }
      const balance = balanceResult.value
      const totalAccountValueInUsd = balance.totalEq

      return {
        ok: true,
        value: {
          originalResponseAsIs: { positionResponse: position, balanceResponse: balance },
          lastBtcPriceInUsd: lastBtcPriceInUsd,
          leverageRatio: leverageRatio,
          collateralInUsd: collateralInUsd,
          exposureInUsd: exposureInUsd,
          totalAccountValueInUsd: totalAccountValueInUsd,
        },
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  public async getInstrumentDetails(): Promise<Result<GetInstrumentDetailsResult>> {
    try {
      const response = await this.exchange.publicGetPublicInstruments({
        instType: "SWAP",
        instId: this.instrumentId,
      })
      this.logger.debug(
        { response },
        `publicGetPublicInstruments(${this.instrumentId}) returned: {response}`,
      )
      assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
      assert(response.ctValCcy === TradeCurrency.USD, ApiError.INVALID_TRADE_SIDE)
      assert(response.minSz > 0, ApiError.NON_POSITIVE_QUANTITY)
      assert(response.ctVal > 0, ApiError.NON_POSITIVE_PRICE)

      return {
        ok: true,
        value: {
          originalResponseAsIs: response,
          minimumOrderSizeInContract: response.minSz,
          contractFaceValue: response.ctVal,
        },
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }
}
