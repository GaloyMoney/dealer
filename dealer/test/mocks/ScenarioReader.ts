import { parse } from "csv-parse/sync"
import fs from "fs"
import { Result } from "src/Result"
import { OrderStatus } from "src/ExchangeTradingType"
import { StepInput } from "./OkexScenarioStepBuilder"

export class ScenarioReader {
  public static getScenarioStepData(filePath: string): Result<StepInput[]> {
    try {
      const input = fs.readFileSync(__dirname + filePath, {
        encoding: "utf8",
      })
      const steps: StepInput[] = parse(input, {
        columns: true,
        skipEmptyLines: true,
        cast: this.castScenarioDataTypeFromString,
      })
      return { ok: true, value: steps }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  private static castScenarioDataTypeFromString(value, context) {
    const numberColumns = [
      "lastPriceInUsd",
      "liabilityInUsd",
      "notionalUsd",
      "notionalUsdAfterOrder",
      "marginInBtc",
      "totalEquityInUsd",
      "totalEquityInUsdAfterTransfer",
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
        return Boolean(value.toString().toLowerCase() === "true")
      } else {
        return value
      }
    }
  }
}
