import { baseLogger } from "src/services/logger"
import { Dealer, UpdatedPositionAndLeverageResult } from "src/Dealer"
import { SupportedExchange } from "src/ExchangeConfiguration"
import { OkexScenarioStepBuilder, StepInput } from "../mocks/OkexScenarioStepBuilder"
import { ScenarioReader } from "../mocks/ScenarioReader"
import { InFlightTransferDb } from "src/InFlightTransferDb"
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

enum SCENARIO_FILE_PATH {
  SCENARIO_00 = "/../data/scenarios.csv",
  SCENARIO_01 = "/../data/scenario_01.csv",
  SCENARIO_02 = "/../data/scenario_02.csv",
}

const exchangeMock = OkexScenarioStepBuilder.getCleanExchangeMock()
const walletMock = OkexScenarioStepBuilder.getCleanWalletMock()

jest.mock("ccxt", () => ({
  okex5: function () {
    return exchangeMock
  },
}))

jest.mock("src/DealerSimulatedWallet", () => ({
  DealerSimulatedWallet: function () {
    return walletMock
  },
}))

/* eslint-disable */
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
/* eslint-enable */

describe("Dealer", () => {
  describe("first scenario", () => {
    it("should execute successfully scenario 01", async () => {
      const logger = baseLogger.child({ module: "cron" })
      const database = new InFlightTransferDb(logger)
      database.clear()
      let dealer = {} as Dealer
      let initDealer = true

      // get the data for the scenario
      const result = ScenarioReader.getScenarioStepData(SCENARIO_FILE_PATH.SCENARIO_01)
      if (!result.ok) {
        expect(result.ok).toBeTruthy()
        return
      }

      // while there's data do:
      const steps: StepInput[] = result.value
      for (const step of steps) {
        // setup a step
        const expected = OkexScenarioStepBuilder.mockScenarioStep(
          step,
          exchangeMock,
          walletMock,
        )

        // run the step
        if (initDealer) {
          initDealer = !initDealer
          dealer = new Dealer(logger)
        }
        logger.info({ step }, `Step '${step.comment}' starting ------->`)
        const result = await dealer.updatePositionAndLeverage()
        logger.info({ step }, `Step '${step.comment}' ended <-------`)
        logger.info({ result }, `Step '${step.comment}' resulted in {result}`)

        // check the step completed
        expect(
          OkexScenarioStepBuilder.checkScenarioCallStats(
            expected,
            exchangeMock,
            walletMock,
          ),
        ).toBeTruthy()

        // check the result
        // expect(result.ok).toBeTruthy()
        // if (result.ok) {
        //   validateResult(result.value, expected.result)
        // }
      }
    })
    it("should execute successfully scenario 02", async () => {
      const logger = baseLogger.child({ module: "cron" })
      const database = new InFlightTransferDb(logger)
      database.clear()
      let dealer = {} as Dealer
      let initDealer = true

      // get the data for the scenario
      const result = ScenarioReader.getScenarioStepData(SCENARIO_FILE_PATH.SCENARIO_02)
      if (!result.ok) {
        expect(result.ok).toBeTruthy()
        return
      }

      // while there's data do:
      const steps: StepInput[] = result.value
      for (const step of steps) {
        // setup a step
        const expected = OkexScenarioStepBuilder.mockScenarioStep(
          step,
          exchangeMock,
          walletMock,
        )

        // run the step
        if (initDealer) {
          initDealer = !initDealer
          dealer = new Dealer(logger)
        }
        logger.info({ step }, `Step '${step.comment}' starting ------->`)
        const result = await dealer.updatePositionAndLeverage()
        logger.info({ step }, `Step '${step.comment}' ended <-------`)
        logger.info({ result }, `Step '${step.comment}' resulted in {result}`)

        // check the step completed
        expect(
          OkexScenarioStepBuilder.checkScenarioCallStats(
            expected,
            exchangeMock,
            walletMock,
          ),
        ).toBeTruthy()

        // check the result
        // expect(result.ok).toBeTruthy()
        // if (result.ok) {
        //   validateResult(result.value, expected.result)
        // }
      }
    })
  })
})
