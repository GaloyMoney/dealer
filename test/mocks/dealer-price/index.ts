import {
  btc2sat,
  cents2usd,
  CENTS_PER_USD,
  sat2btc,
  SATS_PER_BTC,
  toCents,
  toCentsPerSatsRatio,
  toSats,
  toSeconds,
  usd2cents,
} from "src/utils"

export class DealerPriceService implements IDealerPriceService {
  constructor(
    public lastBidInUsdPerBtc = 50_000,
    public lastAskInUsdPerBtc = 50_200,
    public fees = {
      BASE_FEE: 0.0005,
      IMMEDIATE_CONVERSION_SPREAD: 0.0005,
      DELAYED_CONVERSION_SPREAD: 0.001,
    },
  ) {
    //
  }

  public async getCentsFromSatsForImmediateBuy(
    amountInSats: Satoshis,
  ): Promise<UsdCents> {
    const amountInBtc = sat2btc(amountInSats)
    const currentFee = 1 - (this.fees.BASE_FEE + this.fees.IMMEDIATE_CONVERSION_SPREAD)
    const amountInCents = usd2cents(this.lastBidInUsdPerBtc * amountInBtc * currentFee)
    return amountInCents
  }
  public async getCentsFromSatsForImmediateSell(
    amountInSats: Satoshis,
  ): Promise<UsdCents> {
    const amountInBtc = sat2btc(amountInSats)
    // use the ask as the maximum conversion rate
    // preferably higher by a % fee
    const currentFee = 1 + (this.fees.BASE_FEE + this.fees.IMMEDIATE_CONVERSION_SPREAD)
    const amountInCents = usd2cents(this.lastAskInUsdPerBtc * amountInBtc * currentFee)
    return amountInCents
  }
  public async getCentsFromSatsForFutureBuy(
    amountInSats: Satoshis,
    timeToExpiryInSeconds: Seconds,
  ): Promise<UsdCents> {
    const amountInBtc = sat2btc(amountInSats)
    const timeInSeconds = toSeconds(timeToExpiryInSeconds)
    // use the bid as the maximum conversion rate
    // preferably lower by a % fee
    const currentFee = 1 - (this.fees.BASE_FEE + this.fees.DELAYED_CONVERSION_SPREAD)
    const amountInCents = usd2cents(this.lastBidInUsdPerBtc * amountInBtc * currentFee)
    return amountInCents
  }
  public async getCentsFromSatsForFutureSell(
    amountInSats: Satoshis,
    timeToExpiryInSeconds: Seconds,
  ): Promise<UsdCents> {
    const amountInBtc = sat2btc(amountInSats)
    const timeInSeconds = toSeconds(timeToExpiryInSeconds)
    // use the ask as the maximum conversion rate
    // preferably higher by a % fee
    const currentFee = 1 + (this.fees.BASE_FEE + this.fees.DELAYED_CONVERSION_SPREAD)
    const amountInCents = usd2cents(this.lastAskInUsdPerBtc * amountInBtc * currentFee)
    return amountInCents
  }

  public async getSatsFromCentsForImmediateBuy(
    amountInCents: UsdCents,
  ): Promise<Satoshis> {
    const amountInUsd = cents2usd(amountInCents)
    // use the ask as the maximum conversion rate
    // preferably higher by a % fee
    const currentFee = 1 + (this.fees.BASE_FEE + this.fees.IMMEDIATE_CONVERSION_SPREAD)
    const amountInSatoshis = toSats(
      btc2sat(amountInUsd / (this.lastAskInUsdPerBtc * currentFee)),
    )
    return amountInSatoshis
  }
  public async getSatsFromCentsForImmediateSell(amountInCents: UsdCents) {
    const amountInUsd = cents2usd(amountInCents)
    // use the bid as the maximum conversion rate
    // preferably lower by a % fee
    const currentFee = 1 - (this.fees.BASE_FEE + this.fees.IMMEDIATE_CONVERSION_SPREAD)
    const amountInSatoshis = btc2sat(amountInUsd / (this.lastBidInUsdPerBtc * currentFee))
    return toSats(amountInSatoshis)
  }
  public async getSatsFromCentsForFutureBuy(
    amountInCents: UsdCents,
    timeToExpiryInSeconds: Seconds,
  ): Promise<Satoshis> {
    const amountInUsd = cents2usd(amountInCents)
    const timeInSeconds = toSeconds(timeToExpiryInSeconds)
    // use the ask as the maximum conversion rate
    // preferably higher by a % fee
    const currentFee = 1 + (this.fees.BASE_FEE + this.fees.DELAYED_CONVERSION_SPREAD)
    const amountInSatoshis = btc2sat(amountInUsd / (this.lastAskInUsdPerBtc * currentFee))
    return toSats(amountInSatoshis)
  }
  public async getSatsFromCentsForFutureSell(
    amountInCents: UsdCents,
    timeToExpiryInSeconds: Seconds,
  ): Promise<Satoshis> {
    const amountInUsd = cents2usd(amountInCents)
    const timeInSeconds = toSeconds(timeToExpiryInSeconds)
    // use the bid as the maximum conversion rate
    // preferably lower by a % fee
    const currentFee = 1 - (this.fees.BASE_FEE + this.fees.DELAYED_CONVERSION_SPREAD)
    const amountInSatoshis = btc2sat(amountInUsd / (this.lastBidInUsdPerBtc * currentFee))
    return toSats(amountInSatoshis)
  }
  public async getCentsPerSatsExchangeMidRate(): Promise<CentsPerSatsRatio> {
    const lastMid = (this.lastAskInUsdPerBtc + this.lastBidInUsdPerBtc) / 2
    return toCentsPerSatsRatio((lastMid * CENTS_PER_USD) / SATS_PER_BTC)
  }
}
