import { baseLogger } from "../services/logger"
import { Dealer } from "../Dealer"
import { wrapAsyncToRunInSpan } from "../services/tracing"

const main = async () => {
  const logger = baseLogger.child({ module: "cron" })
  const dealer = new Dealer(logger)

  const DealerUpdatePositionAndLeverageTask = () => dealer.updatePositionAndLeverage()
  const wrappedTask = wrapAsyncToRunInSpan({
    root: true,
    namespace: "app.dealer",
    fn: DealerUpdatePositionAndLeverageTask,
  })
  const result = await wrappedTask()
  baseLogger.info({ result }, `dealer.updatePositionAndLeverage() returned: ${result}`)

  // FIXME: we need to exit because we may have some pending promise
  process.exit(0)
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    baseLogger.warn(`Error in Dealer job: ${error}`)
  }
}
