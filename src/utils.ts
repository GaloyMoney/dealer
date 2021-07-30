export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const btc2sat = (btc: number) => {
  return Math.round(btc * Math.pow(10, 8))
}

export const sat2btc = (sat: number) => {
  return sat / Math.pow(10, 8)
}
