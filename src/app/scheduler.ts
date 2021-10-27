import { baseLogger } from "../services/logger"
import cron from "node-cron"
import { Dealer } from "../Dealer"
import { exporter } from "../servers/exporter/exporter"

const logger = baseLogger.child({ module: "cron" })

const scheduler = async () => {
  cron.schedule("0,10,20,30,40,50 * * * *", async () => {
    const dealer = new Dealer(logger)
    try {
      logger.info("Starting dealer")
      await dealer.updatePositionAndLeverage()
    } catch (error) {
      baseLogger.warn(`Error in Dealer job: ${error}`)
    }
  })
}

Promise.all([
  exporter().catch((err) => logger.error(err)),
  scheduler().catch((err) => logger.error(err)),
])
