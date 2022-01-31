import dotenv from "dotenv"

import { baseLogger } from "../../services/logger"
import { Dealer } from "../../Dealer"
import { sleep } from "../../utils"

dotenv.config()

const logger = baseLogger.child({ module: "exporter" })
const dealer = new Dealer(logger)

export let lastBid: number
export let lastAsk: number

export async function loop() {
  while (dealer) {
    try {
      // TODO: replace with fetchTicker() bid and ask
      lastBid = lastAsk = await dealer.getDerivativePriceInUsd()
      logger.debug({ date: new Date(), lastBid, lastAsk }, "Price from exchange")
      await sleep(500)
    } catch (e) {
      logger.error({ e }, "Error: getDerivativePriceInUsd() failed.")
    }
  }
}
