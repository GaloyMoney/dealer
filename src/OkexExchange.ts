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
      assert(btcPriceInUsd !== 0, ApiError.NON_POSITIVE_PRICE)
      assert(btcPriceInUsd, ApiError.MISSING_PARAMETERS)
      assert(btcPriceInUsd > 0, ApiError.NON_POSITIVE_PRICE)

      const result = {} as GetAccountAndPositionRiskResult

      const positionResult = await this.fetchPosition(this.instrumentId)
      this.logger.debug(
        { positionResult },
        `fetchPosition(${this.instrumentId}) returned: {positionResult}`,
      )
      if (!positionResult.ok) {
        if (positionResult.error.message === ApiError.EMPTY_API_RESPONSE) {
          // No position in the derivative yet
          result.lastBtcPriceInUsd = btcPriceInUsd
          result.leverageRatio = 0
          result.collateralInUsd = 0
          result.exposureInUsd = 0
        } else {
          return { ok: false, error: positionResult.error }
        }
      } else {
        const position = positionResult.value
        result.originalPositionResponseAsIs = position
        result.lastBtcPriceInUsd = position.last
        result.leverageRatio = position.notionalUsd / position.last / position.margin
        result.collateralInUsd = position.margin * position.last
        result.exposureInUsd = position.notionalUsd
      }

      const balanceResult = await this.fetchBalance()
      this.logger.debug({ balanceResult }, "fetchBalance() returned: {balanceResult}")
      if (!balanceResult.ok) {
        return { ok: false, error: balanceResult.error }
      }
      const balance = balanceResult.value
      result.originalBalanceResponseAsIs = balance
      result.totalAccountValueInUsd = balance.totalEq

      return {
        ok: true,
        value: result,
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
      assert(
        response.data[0].ctValCcy === TradeCurrency.USD,
        ApiError.UNSUPPORTED_CURRENCY,
      )
      assert(response.data[0].minSz > 0, ApiError.NON_POSITIVE_QUANTITY)
      assert(response.data[0].ctVal > 0, ApiError.NON_POSITIVE_PRICE)

      return {
        ok: true,
        value: {
          originalResponseAsIs: response,
          minimumOrderSizeInContract: Number(response.data[0].minSz),
          contractFaceValue: Number(response.data[0].ctVal),
        },
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }
}
