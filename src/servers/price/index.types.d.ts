type Satoshis = number & { readonly brand: unique symbol }
type UsdCents = number & { readonly brand: unique symbol }
type Seconds = number & { readonly brand: unique symbol }

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
    timeToExpiryInSeconds: Seconds,
  ): Promise<UsdCents | DealerPriceServiceError>
  getExchangeRateForFutureUsdSell(
    amountInUsd: UsdCents,
    timeToExpiryInSeconds: Seconds,
  ): Promise<Satoshis | DealerPriceServiceError>
}
