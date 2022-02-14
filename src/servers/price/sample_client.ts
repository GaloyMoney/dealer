import { DealerPriceService } from "./client_service"

const priceService = DealerPriceService()
const someUsd = 100 as UsdCents
const someSats = 100000 as Satoshis
const fewMins = (2 * 60) as Seconds
export const run = async function () {
  console.info(
    `GetCentsFromSatsForImmediateBuy from service: ${await priceService.getCentsFromSatsForImmediateBuy(
      someSats,
    )}`,
  )
  console.info(
    `GetCentsFromSatsForImmediateSell from service: ${await priceService.getCentsFromSatsForImmediateSell(
      someSats,
    )}`,
  )
  console.info(
    `GetCentsFromSatsForFutureBuy from service: ${await priceService.getCentsFromSatsForFutureBuy(
      someSats,
      fewMins,
    )}`,
  )
  console.info(
    `GetCentsFromSatsForFutureSell from service: ${await priceService.getCentsFromSatsForFutureSell(
      someSats,
      fewMins,
    )}`,
  )

  console.info(
    `getSatsFromCentsForImmediateBuy from service: ${await priceService.getSatsFromCentsForImmediateBuy(
      someUsd,
    )}`,
  )
  console.info(
    `getSatsFromCentsForImmediateSell from service: ${await priceService.getSatsFromCentsForImmediateSell(
      someUsd,
    )}`,
  )
  console.info(
    `getSatsFromCentsForFutureBuy from service: ${await priceService.getSatsFromCentsForFutureBuy(
      someUsd,
      fewMins,
    )}`,
  )
  console.info(
    `getSatsFromCentsForFutureSell from service: ${await priceService.getSatsFromCentsForFutureSell(
      someUsd,
      fewMins,
    )}`,
  )
}

run()
