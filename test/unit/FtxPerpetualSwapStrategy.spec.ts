import { baseLogger } from "src/services/logger"
import { SupportedExchange } from "src/ExchangeConfiguration"
import { FtxPerpetualSwapStrategy } from "src/FtxPerpetualSwapStrategy"

beforeAll(async () => {
  // Init exchange secrets
  for (const exchangeId in SupportedExchange) {
    process.env[`${exchangeId.toUpperCase()}_KEY`] = exchangeId
    process.env[`${exchangeId.toUpperCase()}_SECRET`] = exchangeId
    process.env[`${exchangeId.toUpperCase()}_PASSWORD`] = exchangeId
  }
})

describe("FtxPerpetualSwapStrategy", () => {
  describe("constructor", () => {
    it("should return a FtxPerpetualSwapStrategy", async () => {
      const strategy = new FtxPerpetualSwapStrategy(baseLogger)
      expect(strategy).toBeInstanceOf(FtxPerpetualSwapStrategy)
    })
  })
})
