import dotenv from "dotenv"
import express from "express"
import client, { register } from "prom-client"
import { baseLogger } from "../../services/logger"
import { Dealer } from "../../Dealer"
import { PositionSide } from "../../ExchangeTradingType"

dotenv.config()

const logger = baseLogger.child({ module: "exporter" })

const server = express()

const prefix = "galoy_dealer"

const nextFundingRate_g = new client.Gauge({
  name: `${prefix}_nextFundingRate`,
  help: "forecasted funding rate for the next period",
})

const btcSpotPriceInUsd_g = new client.Gauge({
  name: `${prefix}_btcSpotPriceInUsd`,
  help: "btc spot price from exchange, in usd",
})
const btcMarkPriceInUsd_g = new client.Gauge({
  name: `${prefix}_btcMarkPriceInUsd`,
  help: "btc mark price from exchange, in usd",
})
const btcDerivativePriceInUsd_g = new client.Gauge({
  name: `${prefix}_btcDerivativePriceInUsd`,
  help: "btc derivative instrument price from exchange, in usd",
})

const liabilityInUsd_g = new client.Gauge({
  name: `${prefix}_liabilityInUsd`,
  help: "liability being hedged, in usd",
})

const liabilityInBtc_g = new client.Gauge({
  name: `${prefix}_liabilityInBtc`,
  help: "liability being hedged, in btc",
})

const spotUPnlInUsd_g = new client.Gauge({
  name: `${prefix}_spotUPnlInUsd`,
  help: "spot unrealized profit and loss in USD",
})
const swapUPnlInUsd_g = new client.Gauge({
  name: `${prefix}_swapUPnlInUsd`,
  help: "swap unrealized profit and loss in USD",
})
const strategyUPnlInUsd_g = new client.Gauge({
  name: `${prefix}_strategyUPnlInUsd`,
  help: "strategy unrealized profit and loss in USD",
})
const strategyRPnlInUsd_g = new client.Gauge({
  name: `${prefix}_strategyRPnlInUsd`,
  help: "strategy realized profit and loss in USD",
})
const tradingFeesInSats_g = new client.Gauge({
  name: `${prefix}_tradingFeesInSats`,
  help: "trading fees in sats",
})
const fundingFeesTotalInSats_g = new client.Gauge({
  name: `${prefix}_fundingFeesTotalInSats`,
  help: "total funding fees in sats",
})
const fundingFeesExpenseInSats_g = new client.Gauge({
  name: `${prefix}_fundingFeesExpenseInSats`,
  help: "expense funding fees in sats",
})
const fundingFeesExpenseCount_g = new client.Gauge({
  name: `${prefix}_fundingFeesExpenseCount`,
  help: "# expense funding fees",
})
const fundingFeesIncomeInSats_g = new client.Gauge({
  name: `${prefix}_fundingFeesIncomeInSats`,
  help: "income funding fees in sats",
})
const fundingFeesIncomeCount_g = new client.Gauge({
  name: `${prefix}_fundingFeesIncomeCount`,
  help: "# income funding fees",
})

const lastBtcPriceInUsd_g = new client.Gauge({
  name: `${prefix}_lastBtcPriceInUsd`,
  help: "btc price used to calculate last risk figures, in usd",
})
const leverage_g = new client.Gauge({
  name: `${prefix}_leverage`,
  help: "position leverage, i.e. notional / posted collateral",
})
const leverageRatio_g = new client.Gauge({
  name: `${prefix}_leverageRatio`,
  help: "rebalance leverageRatio, i.e. liability / posted collateral",
})
const collateralInUsd_g = new client.Gauge({
  name: `${prefix}_collateralInUsd`,
  help: "position collateral, in usd",
})
const usedCollateralInUsd_g = new client.Gauge({
  name: `${prefix}_usedCollateralInUsd`,
  help: "used collateral, in usd",
})
const exposureInUsd_g = new client.Gauge({
  name: `${prefix}_exposureInUsd`,
  help: "position exposure or notional, in usd",
})
const totalAccountValueInUsd_g = new client.Gauge({
  name: `${prefix}_totalAccountValueInUsd`,
  help: "total exchange account value, in usd",
})

const autoDeleveragingIndicator_g = new client.Gauge({
  name: `${prefix}_autoDeleveragingIndicator`,
  help: "auto-deleveraging indicator, 1-5, low => low risk",
})
const liquidationPrice_g = new client.Gauge({
  name: `${prefix}_liquidationPrice`,
  help: "estimated liquidation price",
})
const positionQuantity_g = new client.Gauge({
  name: `${prefix}_positionQuantity`,
  help: "number of contract(s)",
})
const positionSide_g = new client.Gauge({
  name: `${prefix}_positionSide`,
  help: "position side: long / short",
})
const averageOpenPrice_g = new client.Gauge({
  name: `${prefix}_averageOpenPrice`,
  help: "average price when position was open",
})
const unrealizedPnL_g = new client.Gauge({
  name: `${prefix}_unrealizedPnL`,
  help: "unrealized profit and loss",
})
const unrealizedPnLRatio_g = new client.Gauge({
  name: `${prefix}_unrealizedPnLRatio`,
  help: "unrealized profit and loss ratio to margin",
})
const marginRatio_g = new client.Gauge({
  name: `${prefix}_marginRatio`,
  help: "margin ratio",
})
const margin_g = new client.Gauge({
  name: `${prefix}_margin`,
  help: "margin",
})
const maintenanceMarginRequirement_g = new client.Gauge({
  name: `${prefix}_maintenanceMarginRequirement`,
  help: "maintenance margin requirement",
})
const exchangeLeverage_g = new client.Gauge({
  name: `${prefix}_exchangeLeverage`,
  help: "leverage used when opening position, liquidating, etc.",
})

const notionalLever_g = new client.Gauge({
  name: `${prefix}_notionalLever`,
  help: "notional lever",
})

const btcFreeBalance_g = new client.Gauge({
  name: `${prefix}_btcFreeBalance`,
  help: "BTC balance not used as collateral",
})
const btcUsedBalance_g = new client.Gauge({
  name: `${prefix}_btcUsedBalance`,
  help: "BTC balance used as collateral",
})
const btcTotalBalance_g = new client.Gauge({
  name: `${prefix}_btcTotalBalance`,
  help: "total BTC balance",
})

export const exporter = async () => {
  server.get("/metrics", async (req, res) => {
    const dealer = new Dealer(logger)

    try {
      let averageOpenPrice = 0
      let swapPositionInContracts = 0
      const liabilityInUsd = await dealer.getLiabilityInUsd()
      const liabilityInBtc = await dealer.getLiabilityInBtc()
      const result = await dealer.getAccountAndPositionRisk()
      if (result.ok) {
        const {
          originalPosition,
          originalBalance,
          lastBtcPriceInUsd,
          leverage,
          usedCollateralInUsd,
          totalCollateralInUsd,
          exposureInUsd,
          totalAccountValueInUsd,
        } = result.value

        lastBtcPriceInUsd_g.set(lastBtcPriceInUsd)
        leverage_g.set(leverage)
        const leverageRatio = exposureInUsd / totalCollateralInUsd
        leverageRatio_g.set(leverageRatio)
        usedCollateralInUsd_g.set(usedCollateralInUsd)
        collateralInUsd_g.set(totalCollateralInUsd)
        exposureInUsd_g.set(exposureInUsd)
        totalAccountValueInUsd_g.set(totalAccountValueInUsd)

        if (originalPosition) {
          autoDeleveragingIndicator_g.set(originalPosition.autoDeleveragingIndicator)
          liquidationPrice_g.set(originalPosition.liquidationPrice)
          swapPositionInContracts = originalPosition.positionQuantity
          positionQuantity_g.set(swapPositionInContracts)
          if (originalPosition.positionSide == PositionSide.Long) {
            positionSide_g.set(1)
          } else if (originalPosition.positionSide == PositionSide.Short) {
            positionSide_g.set(-1)
          } else {
            positionSide_g.set(0)
          }
          averageOpenPrice = originalPosition.averageOpenPrice
          averageOpenPrice_g.set(averageOpenPrice)
          unrealizedPnL_g.set(originalPosition.unrealizedPnL)
          unrealizedPnLRatio_g.set(originalPosition.unrealizedPnLRatio)
          margin_g.set(originalPosition.margin)
          marginRatio_g.set(originalPosition.marginRatio)
          maintenanceMarginRequirement_g.set(
            originalPosition.maintenanceMarginRequirement,
          )
          exchangeLeverage_g.set(originalPosition.exchangeLeverage)
        } else {
          autoDeleveragingIndicator_g.set(0)
          liquidationPrice_g.set(0)
          positionQuantity_g.set(0)
          positionSide_g.set(0)
          averageOpenPrice_g.set(0)
          unrealizedPnL_g.set(0)
          unrealizedPnLRatio_g.set(0)
          margin_g.set(0)
          marginRatio_g.set(0)
          maintenanceMarginRequirement_g.set(0)
          exchangeLeverage_g.set(0)
        }
        if (originalBalance) {
          if (originalBalance.notionalLever) {
            notionalLever_g.set(originalBalance.notionalLever)
          }
          if (originalBalance.btcFreeBalance) {
            btcFreeBalance_g.set(originalBalance.btcFreeBalance)
          }
          if (originalBalance.btcUsedBalance) {
            btcUsedBalance_g.set(originalBalance.btcUsedBalance)
          }
          if (originalBalance.btcTotalBalance) {
            btcTotalBalance_g.set(originalBalance.btcTotalBalance)
          }
        } else {
          notionalLever_g.set(0)
          btcFreeBalance_g.set(0)
          btcUsedBalance_g.set(0)
          btcTotalBalance_g.set(0)
        }
      }
      nextFundingRate_g.set(await dealer.getNextFundingRateInBtc())
      const spotPrice = await dealer.getSpotPriceInUsd()
      btcSpotPriceInUsd_g.set(spotPrice)
      btcMarkPriceInUsd_g.set(await dealer.getMarkPriceInUsd())
      const swapPrice = await dealer.getDerivativePriceInUsd()
      btcDerivativePriceInUsd_g.set(swapPrice)
      liabilityInUsd_g.set(liabilityInUsd)
      liabilityInBtc_g.set(liabilityInBtc)

      // Spot uPnl
      const openSpotQuantityInBtc = liabilityInBtc
      const spotOpenPrice = liabilityInUsd / liabilityInBtc
      const spotUPnlInUsd = (spotPrice - spotOpenPrice) * openSpotQuantityInBtc
      spotUPnlInUsd_g.set(spotUPnlInUsd)

      // Swap uPnl
      const swapOpenPrice = averageOpenPrice
      // TODO use contract face value
      const swapUPnlInUsd =
        100.0 * swapPositionInContracts * (swapPrice / swapOpenPrice - 1.0)
      swapUPnlInUsd_g.set(swapUPnlInUsd)

      // Strategy uPnl
      const strategyUPnl = spotUPnlInUsd - swapUPnlInUsd
      strategyUPnlInUsd_g.set(strategyUPnl)

      // Trading Fees (actual): -26,730 sats
      const tradingFeesInSats = 0
      tradingFeesInSats_g.set(tradingFeesInSats)

      // # of Funding fee expense: 18x, total of -29,775 sats
      const fundingFeesExpenseInSats = 0
      fundingFeesExpenseInSats_g.set(fundingFeesExpenseInSats)
      const fundingFeesExpenseCount = 0
      fundingFeesExpenseCount_g.set(fundingFeesExpenseCount)

      // # of Funding fee income: 15x, total of 20,411 sats
      const fundingFeesIncomeInSats = 0
      fundingFeesIncomeInSats_g.set(fundingFeesIncomeInSats)
      const fundingFeesIncomeCount = 0
      fundingFeesIncomeCount_g.set(fundingFeesIncomeCount)

      // Funding Fees: -9,364 sats @ 48,821 USD/BTC => -4.57 USD
      const fundingFeesTotalInSats = 0
      fundingFeesTotalInSats_g.set(fundingFeesTotalInSats)

      // Realised Profit And Loss (-6.55 USD)
      const strategyRPnl = tradingFeesInSats + fundingFeesTotalInSats
      strategyRPnlInUsd_g.set(strategyRPnl)

      // load transaction to be up-to-date
      await dealer.fetchAndLoadTransactions()
    } catch (error) {
      console.log(error)
      logger.error("Couldn't set dealer wallet metrics")
    }

    res.set("Content-Type", register.contentType)
    res.end(await register.metrics())
  })

  server.get("/healthz", async (req, res) => {
    res.send("OK")
  })

  const port = process.env.PORT || 3333
  logger.info(`Server listening to ${port}, metrics exposed on /metrics endpoint`)
  server.listen(port)
}

// exporter().catch((err) => logger.error(err))
