import { HedgingStrategy, HedgingStrategies } from "./HedgingStrategyTypes"
import { OkexPerpetualSwapStrategy } from "./OkexPerpetualSwapStrategy"

export function createHedgingStrategy(
  strategy: HedgingStrategies,
  logger,
): HedgingStrategy {
  switch (strategy) {
    case HedgingStrategies.OkexPerpetualSwap:
      return new OkexPerpetualSwapStrategy(logger)

    default:
      throw new Error("Not implemented!")
  }
}
