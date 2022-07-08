import { baseLogger } from "../../services/logger"
import { toSats, usd2cents } from "../../utils"

import { DealerPriceService } from "./client_service"

const priceService = DealerPriceService()
const someUsd = usd2cents(100)
const someSats = toSats(100000)
const fewMins = (2 * 60) as Seconds
export const run = async function () {
  baseLogger.info(
    { someSats },
    `GetCentsFromSatsForImmediateBuy from service: ${await priceService.getCentsFromSatsForImmediateBuy(
      someSats,
    )}`,
  )
  baseLogger.info(
    { someSats },
    `GetCentsFromSatsForImmediateSell from service: ${await priceService.getCentsFromSatsForImmediateSell(
      someSats,
    )}`,
  )
  baseLogger.info(
    { someSats, fewMins },
    `GetCentsFromSatsForFutureBuy from service: ${await priceService.getCentsFromSatsForFutureBuy(
      someSats,
      fewMins,
    )}`,
  )
  baseLogger.info(
    { someSats, fewMins },
    `GetCentsFromSatsForFutureSell from service: ${await priceService.getCentsFromSatsForFutureSell(
      someSats,
      fewMins,
    )}`,
  )

  baseLogger.info(
    { someUsd },
    `getSatsFromCentsForImmediateBuy from service: ${await priceService.getSatsFromCentsForImmediateBuy(
      someUsd,
    )}`,
  )
  baseLogger.info(
    { someUsd },
    `getSatsFromCentsForImmediateSell from service: ${await priceService.getSatsFromCentsForImmediateSell(
      someUsd,
    )}`,
  )
  baseLogger.info(
    { someUsd, fewMins },
    `getSatsFromCentsForFutureBuy from service: ${await priceService.getSatsFromCentsForFutureBuy(
      someUsd,
      fewMins,
    )}`,
  )
  baseLogger.info(
    { someUsd, fewMins },
    `getSatsFromCentsForFutureSell from service: ${await priceService.getSatsFromCentsForFutureSell(
      someUsd,
      fewMins,
    )}`,
  )

  baseLogger.info(
    `getCentsPerSatsExchangeMidRate from service: ${await priceService.getCentsPerSatsExchangeMidRate()}`,
  )
}

run()
