export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const roundBtc = (btc: number) => {
  return sat2btc(btc2sat(btc))
}

export const floorBtc = (btc: number) => {
  return sat2btc(Math.floor(btc * SATS_PER_BTC))
}

export const SATS_PER_BTC = 10 ** 8

export const btc2sat = (btc: number) => {
  return Math.round(btc * SATS_PER_BTC)
}

export const sat2btc = (sat: number) => {
  return sat / SATS_PER_BTC
}

export const toSats = (amount: number): Satoshis => {
  // TODO: safety protection during dev. remove before prod (should not throw)
  if (!(amount && amount > 0)) throw new Error("Invalid Sats Amount")
  if (!Number.isInteger(amount))
    throw new Error(`${amount} type ${typeof amount} is not an integer`)
  return amount as Satoshis
}

export const CENTS_PER_USD = 100

export const usd2cents = (usd: number): UsdCents => {
  return toCents(Math.round(usd * CENTS_PER_USD))
}

export const cents2usd = (cents: UsdCents | number): number => {
  return cents / CENTS_PER_USD
}

export const toCents = (amount: number): UsdCents => {
  // TODO: safety protection during dev. remove before prod (should not throw)
  if (!(amount && amount > 0)) throw new Error("Invalid UsdCents Amount")
  if (!Number.isInteger(amount))
    throw new Error(`${amount} type ${typeof amount} is not an integer`)
  return amount as UsdCents
}

export const toCentsPerSatsRatio = (amount: number): CentsPerSatsRatio => {
  return amount as CentsPerSatsRatio
}

export const toSeconds = (timeInSeconds: number): Seconds => {
  // TODO: safety protection during dev. remove before prod (should not throw)
  if (!(timeInSeconds && timeInSeconds > 0)) throw new Error("Invalid Seconds Amount")
  if (!Number.isInteger(timeInSeconds))
    throw new Error(`${timeInSeconds} type ${typeof timeInSeconds} is not an integer`)
  return timeInSeconds as Seconds
}
