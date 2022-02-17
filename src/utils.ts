export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const roundBtc = (btc: number) => {
  return sat2btc(btc2sat(btc))
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
  if (!Number.isInteger(amount))
    throw new Error(`${amount} type ${typeof amount} is not an integer`)
  return amount as Satoshis
}

export const toCents = (amount: number): UsdCents => {
  // TODO: safety protection during dev. remove before prod (should not throw)
  if (!Number.isInteger(amount))
    throw new Error(`${amount} type ${typeof amount} is not an integer`)
  return amount as UsdCents
}

export const toCentsPerSatsRatio = (amount: number): CentsPerSatsRatio => {
  return amount as CentsPerSatsRatio
}
