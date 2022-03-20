import { wrapAsyncToRunInSpan } from "../services/tracing"

// import * as DealerMod from "../Dealer"
import * as schedulerMod from "./scheduler"
import * as exporterMod from "../servers/exporter/exporter"
import * as priceServiceMod from "../servers/price"

import { baseLogger } from "../services/logger"
const logger = baseLogger.child({ module: "wrapper" })

const allFunctions = {
  //   Dealer: { ...DealerMod },
  scheduler: { ...schedulerMod },
  exporter: { ...exporterMod },
  priceService: { ...priceServiceMod },
}

for (const subModule in allFunctions) {
  for (const fn in allFunctions[subModule]) {
    const theFunc = allFunctions[subModule][fn]
    const theFuncName = allFunctions[subModule][fn].name
    logger.info({ subModule, fn, theFunc, theFuncName }, "Wrapping")
    allFunctions[subModule][fn] = wrapAsyncToRunInSpan({
      namespace: `app.${subModule.toLowerCase()}`,
      fn: allFunctions[subModule][fn],
      fnName: fn,
    })
  }
}

export const {
  // Dealer,
  scheduler,
  exporter,
  priceService,
} = allFunctions
