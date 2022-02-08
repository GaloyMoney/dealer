import { DealerPriceService } from "./client_service"

const priceService = DealerPriceService()
const someUsd = 100 as UsdCents
const someSats = 100000 as Satoshis
const fewMins = (2 * 60) as Seconds
export const run = async function () {
  console.info(
    `ExchangeRateForImmediateUsdBuy from service: ${await priceService.getExchangeRateForImmediateUsdBuy(
      someSats,
    )}`,
  )
  console.info(
    `ExchangeRateForImmediateUsdBuyFromCents from service: ${await priceService.getExchangeRateForImmediateUsdBuyFromCents(
      someUsd,
    )}`,
  )
  console.info(
    `ExchangeRateForImmediateUsdSell from service: ${await priceService.getExchangeRateForImmediateUsdSell(
      someUsd,
    )}`,
  )
  console.info(
    `ExchangeRateForImmediateUsdSellFromSatoshis from service: ${await priceService.getExchangeRateForImmediateUsdSellFromSatoshis(
      someSats,
    )}`,
  )
  console.info(
    `QuoteRateForFutureUsdBuy from service: ${await priceService.getQuoteRateForFutureUsdBuy(
      someSats,
      fewMins,
    )}`,
  )
  console.info(
    `QuoteRateForFutureUsdSell from service: ${await priceService.getQuoteRateForFutureUsdSell(
      someUsd,
      fewMins,
    )}`,
  )
}

run()
