import dotenv from "dotenv"

import { baseLogger } from "../../services/logger"
import { Dealer } from "../../Dealer"
import { sleep } from "../../utils"
import { addAttributesToCurrentSpan, SemanticAttributes } from "../../services/tracing"

dotenv.config()

const logger = baseLogger.child({ module: "price-service" })
const dealer = new Dealer(logger)

export let lastBidInUsdPerBtc: number
export let lastAskInUsdPerBtc: number

export async function loop() {
  while (dealer) {
    try {
      const result = await dealer.getDerivativeMarketInfo()
      lastBidInUsdPerBtc = result.bidInUsd
      lastAskInUsdPerBtc = result.askInUsd

      logger.debug(
        { date: new Date(), lastBid: lastBidInUsdPerBtc, lastAsk: lastAskInUsdPerBtc },
        "Price from exchange",
      )

      addAttributesToCurrentSpan({
        [`${SemanticAttributes.CODE_FUNCTION}.results.lastBidInUsdPerBtc`]:
          String(lastBidInUsdPerBtc),
        [`${SemanticAttributes.CODE_FUNCTION}.results.lastAskInUsdPerBtc`]:
          String(lastAskInUsdPerBtc),
      })

      await sleep(500)
    } catch (e) {
      lastBidInUsdPerBtc = NaN
      lastAskInUsdPerBtc = NaN
      logger.error({ e }, "Error: getDerivativePriceInUsd() failed.")
    }
  }
}
