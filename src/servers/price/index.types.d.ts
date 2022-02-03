type Satoshis = number & { readonly brand: unique symbol }
type UsdCents = number & { readonly brand: unique symbol }
type Minutes = number & { readonly brand: unique symbol }

type DealerPriceServiceError = import("./errors").DealerPriceServiceError

interface IDealerPriceService {
  getExchangeRateForImmediateUsdBuy(
    amountInSatoshis: Satoshis,
  ): Promise<UsdCents | DealerPriceServiceError>
  getExchangeRateForImmediateUsdSell(
    amountInUsd: UsdCents,
  ): Promise<Satoshis | DealerPriceServiceError>
  getExchangeRateForFutureUsdBuy(
    amountInSatoshis: Satoshis,
    timeToExpiryInMinutes: Minutes,
  ): Promise<UsdCents | DealerPriceServiceError>
  getExchangeRateForFutureUsdSell(
    amountInUsd: UsdCents,
    timeToExpiryInMinutes: Minutes,
  ): Promise<Satoshis | DealerPriceServiceError>
}
