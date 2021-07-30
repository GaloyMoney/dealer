import { baseLogger } from "src/logger"
import { SupportedExchange } from "src/ExchangeConfiguration"
import { OkexPerpetualSwapStrategy } from "src/OkexPerpetualSwapStrategy"

beforeAll(async () => {
  // Init exchange secrets
  for (const exchangeId in SupportedExchange) {
    process.env[`${exchangeId.toUpperCase()}_KEY`] = exchangeId
    process.env[`${exchangeId.toUpperCase()}_SECRET`] = exchangeId
    process.env[`${exchangeId.toUpperCase()}_PASSWORD`] = exchangeId
  }
})

describe("OkexPerpetualSwapStrategy", () => {
  describe("constructor", () => {
    it("should return a OkexPerpetualSwapStrategy", async () => {
      const strategy = new OkexPerpetualSwapStrategy(baseLogger)
      expect(strategy).toBeInstanceOf(OkexPerpetualSwapStrategy)
    })
  })
})
