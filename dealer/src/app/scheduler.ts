import { baseLogger } from "../services/logger"
import cron from "node-cron"
import { Dealer } from "../Dealer"
import { wrapAsyncToRunInSpan } from "../services/tracing"

const logger = baseLogger.child({ module: "cron" })

export async function scheduler() {
  cron.schedule("0,5,10,15,20,25,30,35,40,45,50,55 * * * *", async () => {
    try {
      const dealer = new Dealer(logger)
      logger.info("Starting Dealer via Scheduler")
      const DealerUpdatePositionAndLeverageTask = () => dealer.updatePositionAndLeverage()
      const wrappedTask = wrapAsyncToRunInSpan({
        namespace: "app.scheduler",
        fn: DealerUpdatePositionAndLeverageTask,
      })
      const result = await wrappedTask()
      baseLogger.info(
        { result },
        `dealer.updatePositionAndLeverage() returned: ${result}`,
      )
    } catch (error) {
      baseLogger.warn(`Error in Scheduler job: ${error}`)
    }
  })
}
