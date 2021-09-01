import {
  GetAccountAndPositionRiskResult,
  GetInstrumentDetailsResult,
  TradeCurrency,
  ApiError,
  GetPublicFundingRateResult,
  SetAccountConfigurationResult,
  GetPublicMarkPriceResult,
  GetMarketIndexTickersResult,
} from "./ExchangeTradingType"
import assert from "assert"
import { ExchangeBase } from "./ExchangeBase"
import {
  ExchangeConfiguration,
  SupportedInstrument,
  SupportedInstrumentType,
} from "./ExchangeConfiguration"
import { OkexExchangeConfiguration } from "./OkexExchangeConfiguration"
import { Result } from "./Result"
import pino from "pino"

export class OkexExchange extends ExchangeBase {
  instrumentId: SupportedInstrument

  constructor(exchangeConfiguration: ExchangeConfiguration, logger: pino.Logger) {
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
        { instrumentId: this.instrumentId, positionResult },
        "fetchPosition({instrumentId}) returned: {positionResult}",
      )
      if (!positionResult.ok) {
        if (
          positionResult.error.message === ApiError.EMPTY_API_RESPONSE ||
          positionResult.error.message === ApiError.UNSUPPORTED_API_RESPONSE
        ) {
          // No position in the derivative yet
          result.lastBtcPriceInUsd = btcPriceInUsd
          result.leverage = 0
          result.exposureInUsd = 0
        } else {
          return { ok: false, error: positionResult.error }
        }
      } else {
        const position = positionResult.value
        result.originalPosition = position
        result.lastBtcPriceInUsd = position.last
        result.leverage = position.notionalUsd / position.last / position.margin
        result.exposureInUsd = position.notionalUsd
      }

      const balanceResult = await this.fetchBalance()
      this.logger.debug({ balanceResult }, "fetchBalance() returned: {balanceResult}")
      if (!balanceResult.ok) {
        return { ok: false, error: balanceResult.error }
      }
      const balance = balanceResult.value
      result.originalBalance = balance
      result.totalAccountValueInUsd = balance.totalEq
      result.collateralInUsd = balance.totalEq

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
        instType: SupportedInstrumentType.Swap,
        instId: this.instrumentId,
      })
      this.logger.debug(
        { instrumentId: this.instrumentId, response },
        "publicGetPublicInstruments({instrumentId}) returned: {response}",
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

  public async getPublicFundingRate(): Promise<Result<GetPublicFundingRateResult>> {
    try {
      const response = await this.exchange.publicGetPublicFundingRate({
        instId: this.instrumentId,
      })
      this.logger.debug(
        { instrumentId: this.instrumentId, response },
        "exchange.publicGetPublicFundingRate({instrumentId}) returned: {response}",
      )
      assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
      assert(
        response.data[0].instId === this.instrumentId,
        ApiError.UNSUPPORTED_INSTRUMENT,
      )
      assert(response.data[0].fundingRate, ApiError.UNSUPPORTED_API_RESPONSE)
      assert(response.data[0].nextFundingRate, ApiError.UNSUPPORTED_API_RESPONSE)

      return {
        ok: true,
        value: {
          originalResponseAsIs: response,
          fundingRate: response.data[0].fundingRate,
          nextFundingRate: response.data[0].nextFundingRate,
        },
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  public async getPublicMarkPrice(): Promise<Result<GetPublicMarkPriceResult>> {
    try {
      const response = await this.exchange.publicGetPublicMarkPrice({
        instType: SupportedInstrumentType.Swap,
        instId: this.instrumentId,
      })
      this.logger.debug(
        { instrumentId: this.instrumentId, response },
        "exchange.publicGetPublicMarkPrice({instrumentId}) returned: {response}",
      )
      assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
      assert(
        response?.data[0]?.instType === SupportedInstrumentType.Swap,
        ApiError.UNSUPPORTED_INSTRUMENT,
      )
      assert(
        response?.data[0]?.instId === this.instrumentId,
        ApiError.UNSUPPORTED_INSTRUMENT,
      )
      assert(response?.data[0]?.markPx, ApiError.UNSUPPORTED_API_RESPONSE)

      return {
        ok: true,
        value: {
          originalResponseAsIs: response,
          markPriceInUsd: Number(response.data[0].markPx),
        },
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  public async getMarketIndexTickers(): Promise<Result<GetMarketIndexTickersResult>> {
    try {
      const response = await this.exchange.publicGetMarketIndexTickers({
        instId: SupportedInstrument.OKEX_BTC_USD_SPOT,
      })
      this.logger.debug(
        { instrumentId: this.instrumentId, response },
        "exchange.publicGetMarketIndexTickers({instrumentId}) returned: {response}",
      )
      assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
      assert(
        response?.data[0]?.instId === SupportedInstrument.OKEX_BTC_USD_SPOT,
        ApiError.UNSUPPORTED_INSTRUMENT,
      )
      assert(response?.data[0]?.idxPx, ApiError.UNSUPPORTED_API_RESPONSE)

      return {
        ok: true,
        value: {
          originalResponseAsIs: response,
          indexPriceInUsd: Number(response.data[0].idxPx),
        },
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  public async setAccountConfiguration(): Promise<Result<SetAccountConfigurationResult>> {
    const config = this.exchangeConfig as OkexExchangeConfiguration

    const args1 = { posMode: config.positionMode }
    const positionResponse = await this.exchange.privatePostAccountSetPositionMode(args1)
    this.logger.debug(
      { args: args1, response: positionResponse },
      "exchange.privatePostAccountSetPositionMode({args}) returned: {response}",
    )
    assert(positionResponse, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(
      positionResponse.data[0].posMode === args1.posMode,
      ApiError.INVALID_POSITION_MODE,
    )

    const args2 = {
      instId: this.instrumentId,
      lever: config.leverage,
      mgnMode: config.marginMode,
    }
    const leverageResponse = await this.exchange.privatePostAccountSetLeverage(args2)
    this.logger.debug(
      { args: args2, response: leverageResponse },
      "exchange.privatePostAccountSetLeverage({args}) returned: {response}",
    )
    assert(leverageResponse, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(
      leverageResponse.data[0].instId === args2.instId.toString(),
      ApiError.INVALID_LEVERAGE_CONFIG,
    )
    assert(
      leverageResponse.data[0].lever === args2.lever.toString(),
      ApiError.INVALID_LEVERAGE_CONFIG,
    )
    assert(
      leverageResponse.data[0].mgnMode === args2.mgnMode.toString(),
      ApiError.INVALID_LEVERAGE_CONFIG,
    )

    return {
      ok: true,
      value: {
        originalResponseAsIs: { positionResponse, leverageResponse },
      },
    }
  }
}
