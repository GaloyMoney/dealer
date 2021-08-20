import express from "express"
import client, { register } from "prom-client"
import { baseLogger } from "../logger"
import { Dealer } from "../Dealer"
// import { setupMongoConnection } from "../mongodb"

const logger = baseLogger.child({ module: "exporter" })

const server = express()

const prefix = "galoy-dealer"

const usdShortPosition_g = new client.Gauge({
  name: `${prefix}_usdShortPosition`,
  help: "usd short position on ftx",
})
const totalAccountValue_g = new client.Gauge({
  name: `${prefix}_totalAccountValue`,
  help: "totalAccountValue on ftx",
})
const ftx_btc_g = new client.Gauge({
  name: `${prefix}_ftxBtcBalance`,
  help: "btc balance in ftx",
})
const ftx_usdPnl_g = new client.Gauge({
  name: `${prefix}_ftxUsdPnl`,
  help: "usd balance in FTX, which also represents the PNL",
})
const dealer_local_btc_g = new client.Gauge({
  name: `${prefix}_dealerLocalBtcBalance`,
  help: "btc balance in for the dealer in the node",
})
const dealer_local_usd_g = new client.Gauge({
  name: `${prefix}_dealerLocalUsdBalance`,
  help: "usd liabilities for the dealer",
})
const dealer_profit_g = new client.Gauge({
  name: `${prefix}_dealerProfit`,
  help: "profit of the dealer wallet",
})
const leverage_g = new client.Gauge({
  name: `${prefix}_leverage`,
  help: "leverage ratio on ftx",
})
const fundingRate_g = new client.Gauge({
  name: `${prefix}_fundingRate`,
  help: "FTX hourly funding rate",
})

const main = async () => {
  server.get("/metrics", async (req, res) => {
    const dealer = new Dealer(logger)

    try {
      const {
        usd: usdShortPosition,
        totalAccountValue,
        leverage,
      } = await dealer.getAccountPosition()

      ftx_btc_g.set((await dealer.getExchangeBalance()).sats)
      ftx_usdPnl_g.set((await dealer.getExchangeBalance()).usdPnl)
      dealer_local_btc_g.set((await dealer.getLocalLiabilities()).satsLnd)
      dealer_local_usd_g.set((await dealer.getLocalLiabilities()).usd)
      dealer_profit_g.set((await dealer.getProfit()).usdProfit)
      totalAccountValue_g.set(totalAccountValue)
      usdShortPosition_g.set(usdShortPosition)
      leverage_g.set(leverage)
      fundingRate_g.set(await dealer.getNextFundingRate())
    } catch (error) {
      logger.error("Couldn't set dealer wallet metrics")
    }

    res.set("Content-Type", register.contentType)
    res.end(await register.metrics())
  })

  server.get("/healthz", async (req, res) => {
    res.send("OK")
  })

  const port = process.env.PORT || 3000
  logger.info(`Server listening to ${port}, metrics exposed on /metrics endpoint`)
  server.listen(port)
}

// setupMongoConnection()
//   .then(() => main())
//   .catch((err) => logger.error(err))

main().catch((err) => logger.error(err))
