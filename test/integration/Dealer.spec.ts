import { baseLogger } from "src/services/logger"
import { Dealer } from "src/Dealer"
import { OrderStatus } from "src/ExchangeTradingType"
import { SupportedExchange } from "src/ExchangeConfiguration"
import { OkexExchangeMockBuilder } from "../mocks/OkexExchangeMockBuilder"
import { WalletType } from "src/DealerWalletFactory"
import { HedgingStrategies } from "src/HedgingStrategyTypes"

beforeAll(async () => {
  // Init non-simulation for the tests
  process.env["HEDGING_NOT_IN_SIMULATION"] = "TRUE"
  process.env["ACTIVE_STRATEGY"] = HedgingStrategies.OkexPerpetualSwap
  process.env["ACTIVE_WALLET"] = WalletType.SimulatedWallet

  // Init exchange secrets
  for (const exchangeId in SupportedExchange) {
    process.env[`${exchangeId.toUpperCase()}_KEY`] = exchangeId
    process.env[`${exchangeId.toUpperCase()}_SECRET`] = exchangeId
    process.env[`${exchangeId.toUpperCase()}_PASSWORD`] = exchangeId
  }
})

class MockScenarioBuilder {
  mockBuilder
  constructor() {
    this.mockBuilder = new OkexExchangeMockBuilder()
    this.mockBuilder.mockThis(
      10000,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      NaN,
      OrderStatus.Canceled,
      0,
      OrderStatus.Canceled,
      false,
      false,
      false,
      true,
      true,
    )
  }

  public getExchangeMock() {
    return this.mockBuilder.getExchangeMockObject()
  }

  public getWalletMock() {
    return this.mockBuilder.getWalletMockObject()
  }
}

const mockScenarios = new MockScenarioBuilder()

jest.mock("ccxt", () => ({
  okex5: function () {
    const exchangeMock = mockScenarios.getExchangeMock()
    return exchangeMock
  },
}))

jest.mock("src/DealerSimulatedWallet", () => ({
  DealerSimulatedWallet: function () {
    const walletMock = mockScenarios.getWalletMock()
    return walletMock
  },
}))

describe("Dealer", () => {
  describe("wallet mocks", () => {
    it("should run clear", async () => {
      const logger = baseLogger.child({ module: "cron" })
      const dealer = new Dealer(logger)

      //   const r0 = await dealer.getWalletOnChainAddress()
      //   console.log(JSON.stringify(r0))

      //   const r1 = await dealer.getUsdLiability()
      //   console.log(JSON.stringify(r1))

      //   const r2 = await dealer.onChainPay({ address: "", btcAmountInSats: 1, memo: "" })
      //   console.log(JSON.stringify(r2))
    })
  })
  describe.only("first call", () => {
    it("should run return an order", async () => {
      const logger = baseLogger.child({ module: "cron" })
      const dealer = new Dealer(logger)

      //   const r0 = await dealer.getWalletOnChainAddress()
      //   console.log(JSON.stringify(r0))

      //   const r1 = await dealer.getUsdLiability()
      //   console.log(JSON.stringify(r1))

      //   const r2 = await dealer.onChainPay({ address: "", btcAmountInSats: 1, memo: "" })
      //   console.log(JSON.stringify(r2))

      const result = await dealer.updatePositionAndLeverage()
      console.log(JSON.stringify(result))
      expect(result.ok).toBeTruthy()
      if (result.ok && result.value.updatedLeverageResult.ok) {
        const updatedLeverage = result.value.updatedLeverageResult.value
        expect(updatedLeverage.originalLeverageRatio).toBeNaN
        expect(updatedLeverage.newLeverageRatio).toBeNaN
      }
    })
  })
})
