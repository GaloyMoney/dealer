import { baseLogger } from "src/logger"
import { Dealer, UpdatedPositionAndLeverageResult } from "src/Dealer"
import { OrderStatus } from "src/ExchangeTradingType"
import { SupportedExchange } from "src/ExchangeConfiguration"
import {
  ExpectedResult,
  OkexExchangeScenarioStepBuilder,
} from "../mocks/OkexExchangeScenarioStepBuilder"
import { InFlightTransferDb } from "src/InFlightTransferDb"
import parse from "csv-parse/lib/sync"
import fs from "fs"

beforeAll(async () => {
  // Init non-simulation for the tests
  process.env["HEDGING_NOT_IN_SIMULATION"] = "TRUE"

  // Init exchange secrets
  for (const exchangeId in SupportedExchange) {
    process.env[`${exchangeId.toUpperCase()}_KEY`] = exchangeId
    process.env[`${exchangeId.toUpperCase()}_SECRET`] = exchangeId
    process.env[`${exchangeId.toUpperCase()}_PASSWORD`] = exchangeId
  }
})

class ScenarioBuilder {
  stepBuilder: OkexExchangeScenarioStepBuilder
  constructor() {
    this.stepBuilder = new OkexExchangeScenarioStepBuilder()

    const input = fs.readFileSync(__dirname + "/../data/scenarios.csv", {
      encoding: "utf8",
    })
    const scenarios = parse(input, {
      columns: true,
      skipEmptyLines: true,
      cast: this.castScenarioDataTypeFromString,
    })
    for (const scenario of scenarios) {
      this.stepBuilder.addScenarioStep(scenario)
    }
  }

  private castScenarioDataTypeFromString(value, context) {
    const numberColumns = [
      "lastPriceInUsd",
      "liabilityInUsd",
      "notionalUsd",
      "marginInBtc",
      "totalEquity",
      "orderId",
      "numberFetchIteration",
    ]

    const booleanColumns = [
      "hasMinimalLiability",
      "isOrderExpected",
      "isOrderSizeOk",
      "wasFundTransferExpected",
      "wasTransferWithdraw",
      "isFundTransferExpected",
      "isTransferWithdraw",
      "expectPositionUpdatedOk",
      "expectLeverageUpdatedOk",
    ]

    if (context.header === true) {
      return value
    } else {
      if (context.column === "firstOrderStatus" || context.column === "lastOrderStatus") {
        return value as OrderStatus
      } else if (numberColumns.includes(context.column)) {
        return Number(value)
      } else if (booleanColumns.includes(context.column)) {
        return Boolean(value)
      } else {
        return value
      }
    }
  }

  public getExchangeMock() {
    return this.stepBuilder.getExchangeMockObject()
  }

  public getWalletMock() {
    return this.stepBuilder.getWalletMockObject()
  }

  public getExpectedResult(): ExpectedResult[] {
    return this.stepBuilder.getExpectedValues()
  }
}

const scenarios = new ScenarioBuilder()

jest.mock("ccxt", () => ({
  okex5: function () {
    const exchangeMock = scenarios.getExchangeMock()
    return exchangeMock
  },
}))

jest.mock("src/DealerMockWallet", () => ({
  DealerMockWallet: function () {
    const walletMock = scenarios.getWalletMock()
    return walletMock
  },
}))

function validateResult(
  result: UpdatedPositionAndLeverageResult,
  expected: UpdatedPositionAndLeverageResult,
) {
  expect(result.updatePositionSkipped).toBe(expected.updatePositionSkipped)
  expect(result.updatedPositionResult.ok).toBe(expected.updatedPositionResult.ok)
  if (result.updatedPositionResult.ok && expected.updatedPositionResult.ok) {
    const updatedPositionResult = result.updatedPositionResult.value
    const updatedPositionExpected = expected.updatedPositionResult.value
    expect(updatedPositionResult).toBe(updatedPositionExpected)
  }

  expect(result.updateLeverageSkipped).toBe(expected.updateLeverageSkipped)
  expect(result.updatedLeverageResult.ok).toBe(expected.updatedLeverageResult.ok)
  if (result.updatedLeverageResult.ok && expected.updatedLeverageResult.ok) {
    const updatedLeverageResult = result.updatedLeverageResult.value
    const updatedLeverageExpected = expected.updatedLeverageResult.value
    expect(updatedLeverageResult).toBe(updatedLeverageExpected)
  }
}

describe("Dealer", () => {
  describe.only("first call", () => {
    it("should run return an order", async () => {
      const logger = baseLogger.child({ module: "cron" })
      const database = new InFlightTransferDb(logger)
      database.clear()
      const expectedResults = scenarios.getExpectedResult()
      const dealer = new Dealer(logger)

      expectedResults.forEach(async (expected) => {
        const result = await dealer.updatePositionAndLeverage()
        logger.info({ result }, `'${expected.comment}' step resulted in {result}`)

        expect(result.ok).toBeTruthy()
        // if (result.ok) {
        //   validateResult(result.value, expected.result)
        // }
      })
    })
  })
})
