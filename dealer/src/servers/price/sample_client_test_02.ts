import { baseLogger } from "../../services/logger"
import { toCents, toSats } from "../../utils"

import { DealerPriceService } from "./client_service"
import { DealerPriceServiceError } from "./errors"

const priceService = DealerPriceService()
const fewMins = (2 * 60) as Seconds
export const run = async function () {
  for (let sats = 100; sats >= 0; sats--) {
    const someSats = toSats(sats)
    const result = await priceService.getCentsFromSatsForImmediateBuy(someSats)
    baseLogger.info(
      { someSats, result },
      `GetCentsFromSatsForImmediateBuy({someSats}) returned: {result}`,
    )
    if (result instanceof DealerPriceServiceError) {
      break
    }
  }
  for (let sats = 100; sats >= 0; sats--) {
    const someSats = toSats(sats)
    const result = await priceService.getCentsFromSatsForImmediateSell(someSats)
    baseLogger.info(
      { someSats, result },
      `GetCentsFromSatsForImmediateSell({someSats}) returned: {result}`,
    )
    if (result instanceof DealerPriceServiceError) {
      break
    }
  }
  for (let sats = 100; sats >= 0; sats--) {
    const someSats = toSats(sats)
    const result = await priceService.getCentsFromSatsForFutureBuy(someSats, fewMins)
    baseLogger.info(
      { someSats, fewMins, result },
      `GetCentsFromSatsForFutureBuy({someSats}, {fewMins}) returned: {result}`,
    )
    if (result instanceof DealerPriceServiceError) {
      break
    }
  }
  for (let sats = 100; sats >= 0; sats--) {
    const someSats = toSats(sats)
    const result = await priceService.getCentsFromSatsForFutureSell(someSats, fewMins)
    baseLogger.info(
      { someSats, fewMins, result },
      `getCentsFromSatsForFutureSell({someSats}, {fewMins}) returned: {result}`,
    )
    if (result instanceof DealerPriceServiceError) {
      break
    }
  }

  for (let cents = 100; cents >= 0; cents--) {
    const someUsd = toCents(cents)
    const result = await priceService.getSatsFromCentsForImmediateBuy(someUsd)
    baseLogger.info(
      { someUsd, result },
      `getSatsFromCentsForImmediateBuy({someUsd}) returned: {result}`,
    )
    if (result instanceof DealerPriceServiceError) {
      break
    }
  }
  for (let cents = 100; cents >= 0; cents--) {
    const someUsd = toCents(cents)
    const result = await priceService.getSatsFromCentsForImmediateSell(someUsd)
    baseLogger.info(
      { someUsd, result },
      `getSatsFromCentsForImmediateSell({someUsd}) returned: {result}`,
    )
    if (result instanceof DealerPriceServiceError) {
      break
    }
  }
  for (let cents = 100; cents >= 0; cents--) {
    const someUsd = toCents(cents)
    const result = await priceService.getSatsFromCentsForFutureBuy(someUsd, fewMins)
    baseLogger.info(
      { someUsd, fewMins, result },
      `getSatsFromCentsForFutureBuy({someUsd}, {fewMins}) returned: {result}`,
    )
    if (result instanceof DealerPriceServiceError) {
      break
    }
  }
  for (let cents = 100; cents >= 0; cents--) {
    const someUsd = toCents(cents)
    const result = await priceService.getSatsFromCentsForFutureSell(someUsd, fewMins)
    baseLogger.info(
      { someUsd, fewMins, result },
      `getSatsFromCentsForFutureSell({someUsd}, {fewMins}) returned: {result}`,
    )
    if (result instanceof DealerPriceServiceError) {
      break
    }
  }

  baseLogger.info(
    `getCentsPerSatsExchangeMidRate from service: ${await priceService.getCentsPerSatsExchangeMidRate()}`,
  )
}

run()
