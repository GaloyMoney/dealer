import { baseLogger } from "src/logger"
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

function getValidFetchPositionResponse(args: {
  last: number
  notionalUsd: number
  margin: number
}) {
  return {
    last: `${args.last}`,
    notionalUsd: `${args.notionalUsd}`,
    margin: `${args.margin}`,
  }
}

function getValidFetchBalanceResponse(args: { balance: number }) {
  return {
    info: {
      data: [
        {
          totalEq: `${args.balance}`,
        },
      ],
    },
  }
}

function getValidPublicGetPublicInstrumentsResponse(args: {
  contractValue: number
  contractMinimumSize: number
  contractValueCurrency: TradeCurrency
  instrumentType: string
  instrumentId: string
}) {
  return {
    code: "0",
    data: [
      {
        ctVal: `${args.contractValue}`,
        minSz: `${args.contractMinimumSize}`,
        ctValCcy: `${args.contractValueCurrency}`,
        instId: `${args.instrumentId}`,
        instType: `${args.instrumentType}`,
      },
    ],
    msg: "",
  }
}

const falsyArgs = [null, undefined, NaN, 0, "", false]

const exchangeMock = {
  checkRequiredCredentials: jest.fn().mockReturnValue(true),
  fetchPosition: jest.fn(),
  fetchBalance: jest.fn(),
  publicGetPublicInstruments: jest.fn(),
}

jest.mock("ccxt", () => ({
  okex5: function () {
    return exchangeMock
  },
}))

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

    it("should return proper risk numbers", async () => {
      const exchangeConfig = new OkexExchangeConfiguration()
      const exchange = new OkexExchange(exchangeConfig, baseLogger)

      const expectedLast = 10000
      const expectedMargin = 10 / expectedLast
      const expectedNotional = 100
      const expectedLeverageRatio = expectedNotional / expectedLast / expectedMargin
      const expectedCollateralInUsd = expectedMargin * expectedLast
      const expectedExposureInUsd = expectedNotional

      exchangeMock.fetchPosition.mockImplementationOnce(() => {
        return getValidFetchPositionResponse({
          last: expectedLast,
          margin: expectedMargin,
          notionalUsd: expectedNotional,
        })
      })

      const expectedTotalEquity = 1234
      exchangeMock.fetchBalance.mockImplementationOnce(() => {
        return getValidFetchBalanceResponse({ balance: expectedTotalEquity })
      })

      const result = await exchange.getAccountAndPositionRisk(expectedLast)
      expect(result.ok).toBeTruthy()
      if (result.ok) {
        const risk = result.value
        expect(risk.lastBtcPriceInUsd).toBe(expectedLast)
        expect(risk.leverageRatio).toBe(expectedLeverageRatio)
        expect(risk.collateralInUsd).toBe(expectedCollateralInUsd)
        expect(risk.exposureInUsd).toBe(expectedExposureInUsd)
        expect(risk.totalAccountValueInUsd).toBe(expectedTotalEquity)
      }
    })
  })

  describe("getInstrumentDetails", () => {
    it("should return error when exchange api call response is falsy", async () => {
      const exchangeConfig = new OkexExchangeConfiguration()
      const exchange = new OkexExchange(exchangeConfig, baseLogger)
      for (const arg of falsyArgs) {
        // Push the exchange api required mocked calls
        exchangeMock.publicGetPublicInstruments.mockImplementationOnce(() => {
          return arg
        })
        // Test based on above mock setup
        const result = await exchange.getInstrumentDetails()
        expect(result.ok).toBeFalsy()
        if (!result.ok) {
          expect(result.error.message).toEqual(ApiError.UNSUPPORTED_API_RESPONSE)
        }
      }
    })

    it("should return error when contract currency is not USD", async () => {
      const exchangeConfig = new OkexExchangeConfiguration()
      const exchange = new OkexExchange(exchangeConfig, baseLogger)
      // Push the exchange api required mocked calls
      exchangeMock.publicGetPublicInstruments.mockImplementationOnce(
        ({ instrumentType, instrumentId }) => {
          return getValidPublicGetPublicInstrumentsResponse({
            contractValue: 1,
            contractMinimumSize: 1,
            contractValueCurrency: TradeCurrency.BTC,
            instrumentType,
            instrumentId,
          })
        },
      )
      // Test based on above mock setup
      const result = await exchange.getInstrumentDetails()
      expect(result.ok).toBeFalsy()
      if (!result.ok) {
        expect(result.error.message).toEqual(ApiError.UNSUPPORTED_CURRENCY)
      }
    })

    it("should return error when contract minimum size is not positive", async () => {
      const exchangeConfig = new OkexExchangeConfiguration()
      const exchange = new OkexExchange(exchangeConfig, baseLogger)

      const invalidQuantity = [0, -1]
      for (const quantity of invalidQuantity) {
        // Push the exchange api required mocked calls
        exchangeMock.publicGetPublicInstruments.mockImplementationOnce(
          ({ instrumentType, instrumentId }) => {
            return getValidPublicGetPublicInstrumentsResponse({
              contractValue: 1,
              contractMinimumSize: quantity,
              contractValueCurrency: TradeCurrency.USD,
              instrumentType,
              instrumentId,
            })
          },
        )
        // Test based on above mock setup
        const result = await exchange.getInstrumentDetails()
        expect(result.ok).toBeFalsy()
        if (!result.ok) {
          expect(result.error.message).toEqual(ApiError.NON_POSITIVE_QUANTITY)
        }
      }
    })

    it("should return error when contract face value is not positive", async () => {
      const exchangeConfig = new OkexExchangeConfiguration()
      const exchange = new OkexExchange(exchangeConfig, baseLogger)

      const invalidQuantity = [0, -1]
      for (const quantity of invalidQuantity) {
        // Push the exchange api required mocked calls
        exchangeMock.publicGetPublicInstruments.mockImplementationOnce(
          ({ instrumentType, instrumentId }) => {
            return getValidPublicGetPublicInstrumentsResponse({
              contractValue: quantity,
              contractMinimumSize: 1,
              contractValueCurrency: TradeCurrency.USD,
              instrumentType,
              instrumentId,
            })
          },
        )
        // Test based on above mock setup
        const result = await exchange.getInstrumentDetails()
        expect(result.ok).toBeFalsy()
        if (!result.ok) {
          expect(result.error.message).toEqual(ApiError.NON_POSITIVE_PRICE)
        }
      }
    })

    it("should return proper contract details", async () => {
      const exchangeConfig = new OkexExchangeConfiguration()
      const exchange = new OkexExchange(exchangeConfig, baseLogger)

      // Push the exchange api required mocked calls
      const contractValue = 1
      const contractMinimumSize = 1
      exchangeMock.publicGetPublicInstruments.mockImplementationOnce(
        ({ instrumentType, instrumentId }) => {
          return getValidPublicGetPublicInstrumentsResponse({
            contractValue: contractValue,
            contractMinimumSize: contractMinimumSize,
            contractValueCurrency: TradeCurrency.USD,
            instrumentType,
            instrumentId,
          })
        },
      )
      // Test based on above mock setup
      const result = await exchange.getInstrumentDetails()
      expect(result.ok).toBeTruthy()
      if (result.ok) {
        const details = result.value
        expect(details.contractFaceValue).toBe(contractValue)
        expect(details.minimumOrderSizeInContract).toBe(contractMinimumSize)
      }
    })
  })
})
