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

const main = async () => {
  server.get("/metrics", async (req, res) => {
    const dealer = new Dealer(logger)

    try {
      const liabilityInUsd = await dealer.getLiabilityInUsd()
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
          positionQuantity_g.set(originalPosition.positionQuantity)
          if (originalPosition.positionSide == PositionSide.Long) {
            positionSide_g.set(1)
          } else if (originalPosition.positionSide == PositionSide.Short) {
            positionSide_g.set(-1)
          } else {
            positionSide_g.set(0)
          }
          averageOpenPrice_g.set(originalPosition.averageOpenPrice)
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
          notionalLever_g.set(originalBalance.notionalLever)
          btcFreeBalance_g.set(originalBalance.btcFreeBalance)
          btcUsedBalance_g.set(originalBalance.btcUsedBalance)
          btcTotalBalance_g.set(originalBalance.btcTotalBalance)
        } else {
          notionalLever_g.set(0)
          btcFreeBalance_g.set(0)
          btcUsedBalance_g.set(0)
          btcTotalBalance_g.set(0)
        }
      }
      nextFundingRate_g.set(await dealer.getNextFundingRateInBtc())
      btcSpotPriceInUsd_g.set(await dealer.getSpotPriceInUsd())
      btcMarkPriceInUsd_g.set(await dealer.getMarkPriceInUsd())
      btcDerivativePriceInUsd_g.set(await dealer.getDerivativePriceInUsd())
      liabilityInUsd_g.set(liabilityInUsd)
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

main().catch((err) => logger.error(err))
