import {
  btc2sat,
  cents2usd,
  sat2btc,
  SATS_PER_BTC,
  toCents,
  toCentsPerSatsRatio,
  toSats,
  toSeconds,
  usd2cents,
} from "src/utils"
import { DealerPriceService } from "test/mocks/dealer-price"

const lastBidInUsdPerBtc = 50_000
const lastAskInUsdPerBtc = 50_020
const fees = {
  BASE_FEE: 0.0005,
  IMMEDIATE_CONVERSION_SPREAD: 0.0005,
  DELAYED_CONVERSION_SPREAD: 0.001,
}
const MAX_EXPECTED_FEE = 1 / 100
const defaultTimeToExpiryInSeconds = toSeconds(60)

const dealer = new DealerPriceService(lastBidInUsdPerBtc, lastAskInUsdPerBtc, fees)

describe("DealerPriceService", () => {
  describe("getCentsFromSatsForImmediateBuy", () => {
    it("should return amount within range", async () => {
      const amountInSats = toSats(100_000)
      const amountInBtc = sat2btc(amountInSats)
      const maxExpectedAmountInCents = usd2cents(lastBidInUsdPerBtc * amountInBtc)

      const feeRate = 1 - MAX_EXPECTED_FEE
      const minExpectedAmountInCents = maxExpectedAmountInCents * feeRate

      const amountInCents = await dealer.getCentsFromSatsForImmediateBuy(amountInSats)

      expect(amountInCents).toBeLessThanOrEqual(maxExpectedAmountInCents)
      expect(amountInCents).toBeGreaterThan(minExpectedAmountInCents)
    })
  })
  describe("getCentsFromSatsForImmediateSell", () => {
    it("should return amount within range", async () => {
      const amountInSats = toSats(100_000)
      const amountInBtc = sat2btc(amountInSats)
      const minExpectedAmountInCents = usd2cents(lastAskInUsdPerBtc * amountInBtc)

      const feeRate = 1 + MAX_EXPECTED_FEE
      const maxExpectedAmountInCents = minExpectedAmountInCents * feeRate

      const amountInCents = await dealer.getCentsFromSatsForImmediateSell(amountInSats)

      expect(amountInCents).toBeLessThanOrEqual(maxExpectedAmountInCents)
      expect(amountInCents).toBeGreaterThan(minExpectedAmountInCents)
    })
  })
  describe("getCentsFromSatsForFutureBuy", () => {
    it("should return amount within range", async () => {
      const amountInSats = toSats(100_000)
      const amountInBtc = sat2btc(amountInSats)
      const maxExpectedAmountInCents = usd2cents(lastBidInUsdPerBtc * amountInBtc)

      const feeRate = 1 - MAX_EXPECTED_FEE
      const minExpectedAmountInCents = maxExpectedAmountInCents * feeRate

      const amountInCents = await dealer.getCentsFromSatsForFutureBuy(
        amountInSats,
        defaultTimeToExpiryInSeconds,
      )

      expect(amountInCents).toBeLessThanOrEqual(maxExpectedAmountInCents)
      expect(amountInCents).toBeGreaterThan(minExpectedAmountInCents)
    })
  })
  describe("getCentsFromSatsForFutureSell", () => {
    it("should return amount within range", async () => {
      const amountInSats = toSats(100_000)
      const amountInBtc = sat2btc(amountInSats)
      const minExpectedAmountInCents = usd2cents(lastAskInUsdPerBtc * amountInBtc)

      const feeRate = 1 + MAX_EXPECTED_FEE
      const maxExpectedAmountInCents = minExpectedAmountInCents * feeRate

      const amountInCents = await dealer.getCentsFromSatsForFutureSell(
        amountInSats,
        defaultTimeToExpiryInSeconds,
      )

      expect(amountInCents).toBeLessThanOrEqual(maxExpectedAmountInCents)
      expect(amountInCents).toBeGreaterThan(minExpectedAmountInCents)
    })
  })
  describe("getSatsFromCentsForImmediateBuy", () => {
    it("should return amount within range", async () => {
      const amountInUsd = 100
      const amountInCents = usd2cents(amountInUsd)
      const maxExpectedAmountInSats = btc2sat(amountInUsd / lastAskInUsdPerBtc)

      const feeRate = 1 + MAX_EXPECTED_FEE
      const minExpectedAmountInSats = maxExpectedAmountInSats / feeRate

      const amountInSats = await dealer.getSatsFromCentsForImmediateBuy(amountInCents)

      expect(amountInSats).toBeLessThanOrEqual(maxExpectedAmountInSats)
      expect(amountInSats).toBeGreaterThan(minExpectedAmountInSats)
    })
  })
  describe("getSatsFromCentsForImmediateSell", () => {
    it("should return amount within range", async () => {
      const amountInUsd = 100
      const amountInCents = usd2cents(amountInUsd)
      const minExpectedAmountInSats = btc2sat(amountInUsd / lastBidInUsdPerBtc)

      const feeRate = 1 - MAX_EXPECTED_FEE
      const maxExpectedAmountInSats = minExpectedAmountInSats / feeRate

      const amountInSats = await dealer.getSatsFromCentsForImmediateSell(amountInCents)

      expect(amountInSats).toBeLessThanOrEqual(maxExpectedAmountInSats)
      expect(amountInSats).toBeGreaterThan(minExpectedAmountInSats)
    })
  })
  describe("getSatsFromCentsForFutureBuy", () => {
    it("should return amount within range", async () => {
      const amountInUsd = 100
      const amountInCents = usd2cents(amountInUsd)
      const maxExpectedAmountInSats = btc2sat(amountInUsd / lastAskInUsdPerBtc)

      const feeRate = 1 + MAX_EXPECTED_FEE
      const minExpectedAmountInSats = maxExpectedAmountInSats / feeRate

      const amountInSats = await dealer.getSatsFromCentsForFutureBuy(
        amountInCents,
        defaultTimeToExpiryInSeconds,
      )

      expect(amountInSats).toBeLessThanOrEqual(maxExpectedAmountInSats)
      expect(amountInSats).toBeGreaterThan(minExpectedAmountInSats)
    })
  })
  describe("getSatsFromCentsForFutureSell", () => {
    it("should return amount within range", async () => {
      const amountInUsd = 100
      const amountInCents = usd2cents(amountInUsd)
      const minExpectedAmountInSats = btc2sat(amountInUsd / lastBidInUsdPerBtc)

      const feeRate = 1 - MAX_EXPECTED_FEE
      const maxExpectedAmountInSats = minExpectedAmountInSats / feeRate

      const amountInSats = await dealer.getSatsFromCentsForFutureSell(
        amountInCents,
        defaultTimeToExpiryInSeconds,
      )

      expect(amountInSats).toBeLessThanOrEqual(maxExpectedAmountInSats)
      expect(amountInSats).toBeGreaterThan(minExpectedAmountInSats)
    })
  })
  describe("getCentsPerSatsExchangeMidRate", () => {
    it("should return mid", async () => {
      const lastMidInUsdPerBtc = (lastBidInUsdPerBtc + lastAskInUsdPerBtc) / 2
      const centsPerBtc = usd2cents(lastMidInUsdPerBtc)
      const expectedAmountInCentsPerSats = toCentsPerSatsRatio(centsPerBtc / SATS_PER_BTC)

      const amountInCentsPerSats = await dealer.getCentsPerSatsExchangeMidRate()

      expect(amountInCentsPerSats).toBe(expectedAmountInCentsPerSats)
    })
  })
})
