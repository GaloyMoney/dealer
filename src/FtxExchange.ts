import {
  GetAccountAndPositionRiskResult,
  GetInstrumentDetailsResult,
  ApiError,
} from "./ExchangeTradingType"
import assert from "assert"
import { ExchangeBase } from "./ExchangeBase"
import { ExchangeConfiguration } from "./ExchangeConfiguration"
import { Result } from "./Result"

export class FtxExchange extends ExchangeBase {
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

      const result = await this.privateGetAccount()
      this.logger.debug({ result }, `privateGetAccount() returned: {result}`)
      if (!result.ok) {
        return { ok: false, error: result.error }
      }

      const response = result.value
      const leverage = response.marginFraction
        ? 1 / response.marginFraction
        : Number.POSITIVE_INFINITY
      const exposureInUsd = -response.netSize * btcPriceInUsd

      return {
        ok: true,
        value: {
          originalPositionResponseAsIs: response,
          originalBalanceResponseAsIs: response,
          lastBtcPriceInUsd: btcPriceInUsd,
          leverageRatio: leverage,
          collateralInUsd: response.collateral,
          exposureInUsd: exposureInUsd,
          totalAccountValueInUsd: response.totalAccountValue,
        },
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  public async getInstrumentDetails(): Promise<Result<GetInstrumentDetailsResult>> {
    return { ok: false, error: new Error(ApiError.NOT_IMPLEMENTED) }
  }
}
