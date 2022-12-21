import nodePgMigrate from "node-pg-migrate"
import { RunnerOption } from "node-pg-migrate/dist/types"

import { baseLogger } from "../services/logger"

// import { exporter } from "../servers/exporter/exporter"
// import { scheduler } from "./scheduler"
// import { priceService } from "../servers/price"

import {
  addAttributesToCurrentSpan,
  SemanticAttributes,
  wrapAsyncToRunInSpan,
} from "../services/tracing"

import { exporter, priceService } from "."

const logger = baseLogger.child({ module: "cron" })

const options = {
  migrationsTable: "pgmigrations",
  dir: "dealer/migrations",
  createSchema: true,
  schema: "dealer",
  direction: "up",
  count: 100,
  verbose: true,
  databaseUrl: process.env["DATABASE_URL"],
} as RunnerOption

const main = async () => {
  try {
    const pgMigrate = async () => {
      const results = await nodePgMigrate(options)
      logger.info({ results }, "PG Migration results.")
      addAttributesToCurrentSpan({
        [`${SemanticAttributes.CODE_FUNCTION}.results`]: JSON.stringify(results),
      })
    }
    const wrappedTask = wrapAsyncToRunInSpan({ namespace: "cron", fn: pgMigrate })
    await wrappedTask()
  } catch (error) {
    logger.error({ error }, "issue with pg migration")
  }

  const tasks = {
    ["exporter"]: exporter.exporter,
    // ["scheduler"]: scheduler.scheduler,        // unscheduling/disabling all funding & hedging function
    ["priceService"]: priceService.priceService,
  }

  for (const taskName in tasks) {
    try {
      const task = tasks[taskName]
      logger.info(`starting ${taskName}`)
      const wrappedTask = wrapAsyncToRunInSpan({
        namespace: "cron",
        fn: task,
        fnName: taskName,
      })
      await wrappedTask()
    } catch (error) {
      logger.error({ error }, `issue with task ${taskName}`)
    }
  }
}

try {
  main()
} catch (error) {
  logger.warn({ error }, "error in the cron job")
}
