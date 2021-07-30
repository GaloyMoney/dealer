// import { setupMongoConnection } from "../mongodb"
// import { baseLogger } from "../logger"
// import { User } from "../schema"
// import { getCurrentPrice } from "../realtimePrice"
// import { UserWallet } from "../userWallet"
// import { Dealer } from "../dealer/Dealer"

// const main = async () => {
//   const lastPrice = await getCurrentPrice()
//   UserWallet.setCurrentPrice(lastPrice)

//   const logger = baseLogger.child({ module: "cron" })
//   const dealerUser = await User.findOne({ role: "dealer" })
//   const dealer = new Dealer({ user: dealerUser, logger })

//   await dealer.updatePositionAndLeverage()

//   // FIXME: we need to exit because we may have some pending promise
//   process.exit(0)
// }

// if (require.main === module) {
//   try {
//     main()
//   } catch (error) {
//     baseLogger.warn(`Error in Dealer job: ${error}`)
//   }
// }
