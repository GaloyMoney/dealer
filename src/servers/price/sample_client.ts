import { DealerPriceService } from "./client_service"

const priceService = DealerPriceService()
const someUsd = 100 as UsdCents
const someSats = 100000 as Satoshis
const fewMins = (2 * 60) as Seconds
export const run = async function () {
  console.info(
    `ExchangeRateForFutureUsdBuy from service: ${await priceService.getExchangeRateForFutureUsdBuy(
      someSats,
      fewMins,
    )}`,
  )
  console.info(
    `ExchangeRateForFutureUsdSell from service: ${await priceService.getExchangeRateForFutureUsdSell(
      someUsd,
      fewMins,
    )}`,
  )
  console.info(
    `ExchangeRateForImmediateUsdBuy from service: ${await priceService.getExchangeRateForImmediateUsdBuy(
      someSats,
    )}`,
  )
  console.info(
    `ExchangeRateForImmediateUsdSell from service: ${await priceService.getExchangeRateForImmediateUsdSell(
      someUsd,
    )}`,
  )
}

run()
