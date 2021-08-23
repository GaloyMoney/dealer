import { baseLogger } from "src/services/logger"
import { SupportedExchange, SupportedInstrument } from "src/ExchangeConfiguration"
import { OkexExchangeConfiguration } from "src/OkexExchangeConfiguration"
import { OkexExchange } from "src/OkexExchange"
import {
  WithdrawParameters,
  CreateOrderParameters,
  SupportedChain,
  TradeCurrency,
  TradeSide,
  TradeType,
  ApiError,
  OrderStatus,
} from "src/ExchangeTradingType"
import { AssertionError } from "assert"

beforeAll(async () => {
  // Init exchange secrets
  for (const exchangeId in SupportedExchange) {
    process.env[`${exchangeId.toUpperCase()}_KEY`] = exchangeId
    process.env[`${exchangeId.toUpperCase()}_SECRET`] = exchangeId
    process.env[`${exchangeId.toUpperCase()}_PASSWORD`] = exchangeId
  }
})

const falsyArgs = [null, undefined, NaN, 0, "", false]

describe("OkexExchange", () => {
  describe("constructor", () => {
    it("should return a OkexExchangeConfiguration", async () => {
      const exchangeConfig = new OkexExchangeConfiguration()
      const exchange = new OkexExchange(exchangeConfig, baseLogger)
      expect(exchange).toBeInstanceOf(OkexExchange)
    })

    it("should use Okex exchange id", async () => {
      const exchangeConfig = new OkexExchangeConfiguration()
      const exchange = new OkexExchange(exchangeConfig, baseLogger)
      expect(exchange.exchangeId).toBe(SupportedExchange.OKEX5)
    })

    it("should use Okex perpetual swap", async () => {
      const exchangeConfig = new OkexExchangeConfiguration()
      const exchange = new OkexExchange(exchangeConfig, baseLogger)
      expect(exchange.instrumentId).toBe(SupportedInstrument.OKEX_PERPETUAL_SWAP)
    })
  })

  describe("getAccountAndPositionRisk", () => {
    it("should throw when argument is falsy", async () => {
      const exchangeConfig = new OkexExchangeConfiguration()
      const exchange = new OkexExchange(exchangeConfig, baseLogger)
      for (const arg of falsyArgs) {
        if (arg !== 0) {
          const result = await exchange.getAccountAndPositionRisk(arg)
          expect(result.ok).toBeFalsy()
          if (!result.ok) {
            expect(result.error.message).toEqual(ApiError.MISSING_PARAMETERS)
          }
        }
      }
    })

    it("should throw when argument is non positive", async () => {
      const exchangeConfig = new OkexExchangeConfiguration()
      const exchange = new OkexExchange(exchangeConfig, baseLogger)
      const invalidQuantity = [0, -1]
      for (const arg of invalidQuantity) {
        const result = await exchange.getAccountAndPositionRisk(arg)
        expect(result.ok).toBeFalsy()
        if (!result.ok) {
          expect(result.error.message).toEqual(ApiError.NON_POSITIVE_PRICE)
        }
      }
    })

    it("should return proper leverageRatio", async () => {
      const exchangeConfig = new OkexExchangeConfiguration()
      const exchange = new OkexExchange(exchangeConfig, baseLogger)
      // need a mock up of ExchangeBase.fetchPosition()
      //  and of ExchangeBase.fetchBalance()
      // to test the logic in this.getAccountAndPositionRisk()
      // TODO:
      //  test leverageRatio result from mock'd ExchangeBase.privateGetAccount() response
      expect(exchange).toBeInstanceOf(OkexExchange)
    })

    it("should return proper collateralInUsd", async () => {
      const exchangeConfig = new OkexExchangeConfiguration()
      const exchange = new OkexExchange(exchangeConfig, baseLogger)
      // need a mock up of ExchangeBase.fetchPosition()
      //  and of ExchangeBase.fetchBalance()
      // to test the logic in this.getAccountAndPositionRisk()
      // TODO:
      //  test collateralInUsd result from mock'd ExchangeBase.privateGetAccount() response
      expect(exchange).toBeInstanceOf(OkexExchange)
    })
  })

  describe("getInstrumentDetails", () => {
    it("should return proper collateralInUsd", async () => {
      const exchangeConfig = new OkexExchangeConfiguration()
      const exchange = new OkexExchange(exchangeConfig, baseLogger)
      // need a mock up of ccxt exchange.publicGetPublicInstruments()
      // to test the logic in this.getInstrumentDetails()
      // TODO:
      //  test collateralInUsd result from mock'd ExchangeBase.privateGetAccount() response
      expect(exchange).toBeInstanceOf(OkexExchange)
    })
  })
})
