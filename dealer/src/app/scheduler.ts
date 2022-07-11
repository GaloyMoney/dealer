import cron from "node-cron"

import { baseLogger } from "../services/logger"
import { Dealer } from "../Dealer"
import { recordExceptionInCurrentSpan, wrapAsyncToRunInSpan } from "../services/tracing"
import { ErrorLevel } from "../Result"

const logger = baseLogger.child({ module: "cron" })

export async function scheduler() {
  cron.schedule(
    "0,5,10,15,20,25,30,35,40,45,50,55 * * * *",
    wrapAsyncToRunInSpan({
      root: true,
      namespace: "app.scheduler",
      fnName: "run",
      fn: async () => {
        try {
          logger.info("Starting Dealer via Scheduler")

          const dealer = new Dealer(logger)
          const result = await dealer.updatePositionAndLeverage()

          baseLogger.info({ result }, `Update position and leverage result`)
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          baseLogger.warn({ error }, "Error in Scheduler job")
        }
      },
    }),
  )
}
