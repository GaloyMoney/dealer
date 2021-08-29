import { baseLogger } from "src/services/logger"
import { HedgingStrategies } from "src/HedgingStrategyTypes"
import { createHedgingStrategy } from "src/HedgingStrategyFactory"
import { OkexPerpetualSwapStrategy } from "src/OkexPerpetualSwapStrategy"
import { SupportedExchange } from "src/ExchangeConfiguration"

beforeAll(async () => {
  // Init exchange secrets
  for (const exchangeId in SupportedExchange) {
    process.env[`${exchangeId.toUpperCase()}_KEY`] = exchangeId
    process.env[`${exchangeId.toUpperCase()}_SECRET`] = exchangeId
    process.env[`${exchangeId.toUpperCase()}_PASSWORD`] = exchangeId
  }
})

describe("HedgingStrategyFactory", () => {
  describe("createHedgingStrategy", () => {
    it("should return a OkexPerpetualSwapStrategy", async () => {
      const strategy = createHedgingStrategy(
        HedgingStrategies.OkexPerpetualSwap,
        baseLogger,
      )

      expect(strategy).toBeInstanceOf(OkexPerpetualSwapStrategy)
    })

    it("should throw and Error", async () => {
      expect(() =>
        createHedgingStrategy(HedgingStrategies.OkexInverseFutures, baseLogger),
      ).toThrowError()
    })
  })
})
