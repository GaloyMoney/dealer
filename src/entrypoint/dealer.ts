import { baseLogger } from "../logger"
import { Dealer } from "../Dealer"

const main = async () => {
  const logger = baseLogger.child({ module: "cron" })
  const dealer = new Dealer(logger)

  await dealer.updatePositionAndLeverage()

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
