import { baseLogger } from "../services/logger"
import cron from "node-cron"
import { Dealer } from "../Dealer"
import { exporter } from "../servers/exporter/exporter"
import nodePgMigrate from "node-pg-migrate"
import { RunnerOption } from "node-pg-migrate/dist/types"
import { priceService } from "../servers/price"

const logger = baseLogger.child({ module: "cron" })

const options = {
  migrationsTable: "pgmigrations",
  dir: "migrations",
  createSchema: true,
  schema: "dealer",
  direction: "up",
  count: 100,
  verbose: true,
  databaseUrl: process.env["DATABASE_URL"],
} as RunnerOption

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
  priceService().catch((err) => logger.error(err)),
  scheduler().catch((err) => logger.error(err)),
  nodePgMigrate(options).catch((err) => logger.error(err)),
])
