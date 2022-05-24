import dotenv from "dotenv"
import express from "express"
import client, { register } from "prom-client"
import { baseLogger } from "../../services/logger"
import { Dealer } from "../../Dealer"
import { PositionSide } from "../../ExchangeTradingType"
import {
  addAttributesToCurrentSpan,
  asyncRunInSpan,
  recordExceptionInCurrentSpan,
  SemanticAttributes,
} from "../../services/tracing"
import { ErrorLevel } from "../../Result"

dotenv.config()

const logger = baseLogger.child({ module: "exporter" })

const server = express()

const prefix = "galoy_dealer"

interface IMetricData {
  value: number
  gauge: client.Gauge<string>
}

class Metrics {
  public static set(obj: IMetricData, metric: number) {
    obj.value = metric
    obj.gauge.set(metric)
  }
}

const metrics: { [key: string]: IMetricData } = {
  nextFundingRate: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_nextFundingRate`,
      help: "forecasted funding rate for the next period",
    }),
  },

  btcSpotPriceInUsd: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_btcSpotPriceInUsd`,
      help: "btc spot price from exchange, in usd",
    }),
  },
  btcMarkPriceInUsd: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_btcMarkPriceInUsd`,
      help: "btc mark price from exchange, in usd",
    }),
  },
  btcDerivativePriceInUsd: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_btcDerivativePriceInUsd`,
      help: "btc derivative instrument price from exchange, in usd",
    }),
  },

  liabilityInUsd: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_liabilityInUsd`,
      help: "liability being hedged, in usd",
    }),
  },

  liabilityInBtc: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_liabilityInBtc`,
      help: "liability being hedged, in btc",
    }),
  },

  spotUPnlInUsd: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_spotUPnlInUsd`,
      help: "spot unrealized profit and loss in USD",
    }),
  },
  swapUPnlInUsd: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_swapUPnlInUsd`,
      help: "swap unrealized profit and loss in USD",
    }),
  },
  strategyUPnlInUsd: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_strategyUPnlInUsd`,
      help: "strategy unrealized profit and loss in USD",
    }),
  },
  strategyRPnlInSats: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_strategyRPnlInSats`,
      help: "strategy realized profit and loss in sats",
    }),
  },
  tradingFeesTotalInSats: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_tradingFeesTotalInSats`,
      help: "trading fees total in sats",
    }),
  },
  tradingFeesBuyInSats: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_tradingFeesBuyInSats`,
      help: "trading fees buy in sats",
    }),
  },
  tradingFeesBuyCount: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_tradingFeesBuyCount`,
      help: "trading fees buy count",
    }),
  },
  tradingFeesSellInSats: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_tradingFeesSellInSats`,
      help: "trading fees sell in sats",
    }),
  },
  tradingFeesSellCount: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_tradingFeesSellCount`,
      help: "trading fees sell count",
    }),
  },
  totalInFlightTransfersCount: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_totalInFlightTransfersCount`,
      help: "total in-flight transfers count",
    }),
  },
  completedDepositCount: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_completedDepositCount`,
      help: "completed in-flight deposit count",
    }),
  },
  completedWithdrawalCount: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_completedWithdrawalCount`,
      help: "complete in-flight withdrawal count",
    }),
  },
  pendingDepositCount: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_pendingDepositCount`,
      help: "pending in-flight deposit count",
    }),
  },
  pendingWithdrawalCount: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_pendingWithdrawalCount`,
      help: "pending in-flight withdrawal count",
    }),
  },
  fundingFeesTotalInSats: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingFeesTotalInSats`,
      help: "total funding fees in sats",
    }),
  },
  fundingFeesExpenseInSats: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingFeesExpenseInSats`,
      help: "expense funding fees in sats",
    }),
  },
  fundingFeesExpenseCount: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingFeesExpenseCount`,
      help: "# expense funding fees",
    }),
  },
  fundingFeesIncomeInSats: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingFeesIncomeInSats`,
      help: "income funding fees in sats",
    }),
  },
  fundingFeesIncomeCount: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingFeesIncomeCount`,
      help: "# income funding fees",
    }),
  },

  lastBtcPriceInUsd: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_lastBtcPriceInUsd`,
      help: "btc price used to calculate last risk figures, in usd",
    }),
  },
  leverage: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_leverage`,
      help: "position leverage, i.e. notional / posted collateral",
    }),
  },
  leverageRatio: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_leverageRatio`,
      help: "rebalance leverageRatio, i.e. liability / posted collateral",
    }),
  },
  collateralInUsd: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_collateralInUsd`,
      help: "position collateral, in usd",
    }),
  },
  usedCollateralInUsd: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_usedCollateralInUsd`,
      help: "used collateral, in usd",
    }),
  },
  exposureInUsd: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_exposureInUsd`,
      help: "position exposure or notional, in usd",
    }),
  },
  totalAccountValueInUsd: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_totalAccountValueInUsd`,
      help: "total exchange account value, in usd",
    }),
  },

  autoDeleveragingIndicator: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_autoDeleveragingIndicator`,
      help: "auto-deleveraging indicator, 1-5, low => low risk",
    }),
  },
  liquidationPrice: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_liquidationPrice`,
      help: "estimated liquidation price",
    }),
  },
  positionQuantity: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_positionQuantity`,
      help: "number of contract(s)",
    }),
  },
  positionSide: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_positionSide`,
      help: "position side: long / short",
    }),
  },
  averageOpenPrice: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_averageOpenPrice`,
      help: "average price when position was open",
    }),
  },
  unrealizedPnL: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_unrealizedPnL`,
      help: "unrealized profit and loss",
    }),
  },
  unrealizedPnLRatio: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_unrealizedPnLRatio`,
      help: "unrealized profit and loss ratio to margin",
    }),
  },
  marginRatio: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_marginRatio`,
      help: "margin ratio",
    }),
  },
  margin: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_margin`,
      help: "margin",
    }),
  },
  maintenanceMarginRequirement: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_maintenanceMarginRequirement`,
      help: "maintenance margin requirement",
    }),
  },
  exchangeLeverage: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_exchangeLeverage`,
      help: "leverage used when opening position, liquidating, etc.",
    }),
  },

  notionalLever: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_notionalLever`,
      help: "notional lever",
    }),
  },

  btcFreeBalance: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_btcFreeBalance`,
      help: "BTC balance not used as collateral",
    }),
  },
  btcUsedBalance: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_btcUsedBalance`,
      help: "BTC balance used as collateral",
    }),
  },
  btcTotalBalance: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_btcTotalBalance`,
      help: "total BTC balance",
    }),
  },

  fundingAccountBtcFreeBalance: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingAccountBtcFreeBalance`,
      help: "exchange funding account BTC balance not used as collateral",
    }),
  },
  fundingAccountBtcUsedBalance: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingAccountBtcUsedBalance`,
      help: "exchange funding account BTC balance used as collateral",
    }),
  },
  fundingAccountBtcTotalBalance: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingAccountBtcTotalBalance`,
      help: "exchange funding account total BTC balance",
    }),
  },

  fundingYield1d: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingYield1d`,
      help: "1d funding yield",
    }),
  },
  fundingYield1W: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingYield1W`,
      help: "1W funding yield",
    }),
  },
  fundingYield2W: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingYield2W`,
      help: "2W funding yield",
    }),
  },
  fundingYield3W: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingYield3W`,
      help: "3W funding yield",
    }),
  },
  fundingYield1M: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingYield1M`,
      help: "1M funding yield",
    }),
  },
  fundingYield2M: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingYield2M`,
      help: "2M funding yield",
    }),
  },
  fundingYield3M: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingYield3M`,
      help: "3M funding yield",
    }),
  },
  fundingYield6M: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingYield6M`,
      help: "6M funding yield",
    }),
  },
  fundingYield1Y: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingYield1Y`,
      help: "1Y funding yield",
    }),
  },
  fundingYield2Y: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingYield2Y`,
      help: "2Y funding yield",
    }),
  },
  fundingYield3Y: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingYield3Y`,
      help: "3Y funding yield",
    }),
  },
  fundingYield5Y: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_fundingYield5Y`,
      help: "5Y funding yield",
    }),
  },
  exchangeStatus: {
    value: NaN,
    gauge: new client.Gauge({
      name: `${prefix}_exchangeStatus`,
      help: "exchange alive status",
    }),
  },
}

export async function exporter() {
  server.get("/metrics", async (req, res) => {
    asyncRunInSpan(
      "app.exporter.metrics",
      {
        [SemanticAttributes.CODE_FUNCTION]: "metrics",
        [SemanticAttributes.CODE_NAMESPACE]: "app.exporter",
      },
      async () => {
        for (const metricName in metrics) {
          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.${metricName}`]: NaN,
          })
        }

        try {
          const dealer = new Dealer(logger)

          // load transaction to be up-to-date
          await dealer.fetchAndLoadTransactions()

          // load funding rates to be up-to-date
          await dealer.fetchAndLoadFundingRates()

          let btcBalanceOnExchange = 0
          let averageOpenPrice = 0
          let swapPosInCt = 0
          const liabilityInUsd = await dealer.getLiabilityInUsd()
          const liabilityInBtc = await dealer.getLiabilityInBtc()
          const result = await dealer.getAccountAndPositionRisk()
          if (result.ok) {
            const {
              originalPosition: ogPos,
              originalBalance: ogBal,
              lastBtcPriceInUsd,
              leverage,
              usedCollateralInUsd,
              totalCollateralInUsd,
              exposureInUsd,
              totalAccountValueInUsd,
            } = result.value

            Metrics.set(metrics["lastBtcPriceInUsd"], lastBtcPriceInUsd)
            Metrics.set(metrics["leverage"], leverage)
            const leverageRatio = exposureInUsd / totalCollateralInUsd
            Metrics.set(metrics["leverageRatio"], leverageRatio)
            Metrics.set(metrics["usedCollateralInUsd"], usedCollateralInUsd)
            Metrics.set(metrics["collateralInUsd"], totalCollateralInUsd)
            Metrics.set(metrics["exposureInUsd"], exposureInUsd)
            Metrics.set(metrics["totalAccountValueInUsd"], totalAccountValueInUsd)

            if (ogPos) {
              Metrics.set(
                metrics["autoDeleveragingIndicator"],
                ogPos.autoDeleveragingIndicator,
              )
              Metrics.set(metrics["liquidationPrice"], ogPos.liquidationPrice)
              swapPosInCt = ogPos.positionQuantity
              Metrics.set(metrics["positionQuantity"], swapPosInCt)
              if (ogPos.positionSide == PositionSide.Long) {
                Metrics.set(metrics["positionSide"], 1)
              } else if (ogPos.positionSide == PositionSide.Short) {
                Metrics.set(metrics["positionSide"], -1)
              } else {
                Metrics.set(metrics["positionSide"], 0)
              }
              averageOpenPrice = ogPos.averageOpenPrice
              Metrics.set(metrics["averageOpenPrice"], averageOpenPrice)
              Metrics.set(metrics["unrealizedPnL"], ogPos.unrealizedPnL)
              Metrics.set(metrics["unrealizedPnLRatio"], ogPos.unrealizedPnLRatio)
              Metrics.set(metrics["margin"], ogPos.margin)
              Metrics.set(metrics["marginRatio"], ogPos.marginRatio)
              Metrics.set(
                metrics["maintenanceMarginRequirement"],
                ogPos.maintenanceMarginRequirement,
              )
              Metrics.set(metrics["exchangeLeverage"], ogPos.exchangeLeverage)
            } else {
              Metrics.set(metrics["autoDeleveragingIndicator"], 0)
              Metrics.set(metrics["liquidationPrice"], 0)
              Metrics.set(metrics["positionQuantity"], 0)
              Metrics.set(metrics["positionSide"], 0)
              Metrics.set(metrics["averageOpenPrice"], 0)
              Metrics.set(metrics["unrealizedPnL"], 0)
              Metrics.set(metrics["unrealizedPnLRatio"], 0)
              Metrics.set(metrics["margin"], 0)
              Metrics.set(metrics["marginRatio"], 0)
              Metrics.set(metrics["maintenanceMarginRequirement"], 0)
              Metrics.set(metrics["exchangeLeverage"], 0)
            }
            Metrics.set(metrics["notionalLever"], 0)
            Metrics.set(metrics["btcFreeBalance"], 0)
            Metrics.set(metrics["btcUsedBalance"], 0)
            Metrics.set(metrics["btcTotalBalance"], 0)
            if (ogBal) {
              if (ogBal.notionalLever) {
                Metrics.set(metrics["notionalLever"], ogBal.notionalLever)
              }
              if (ogBal.btcFreeBalance) {
                Metrics.set(metrics["btcFreeBalance"], ogBal.btcFreeBalance)
              }
              if (ogBal.btcUsedBalance) {
                Metrics.set(metrics["btcUsedBalance"], ogBal.btcUsedBalance)
              }
              if (ogBal.btcTotalBalance) {
                Metrics.set(metrics["btcTotalBalance"], ogBal.btcTotalBalance)
                btcBalanceOnExchange += ogBal.btcTotalBalance
              }
            }
          }
          Metrics.set(metrics["nextFundingRate"], await dealer.getNextFundingRateInBtc())
          const spotPrice = await dealer.getSpotPriceInUsd()
          Metrics.set(metrics["btcSpotPriceInUsd"], spotPrice)
          Metrics.set(metrics["btcMarkPriceInUsd"], await dealer.getMarkPriceInUsd())
          const swapPrice = await dealer.getDerivativePriceInUsd()
          Metrics.set(metrics["btcDerivativePriceInUsd"], swapPrice)
          Metrics.set(metrics["liabilityInUsd"], liabilityInUsd)
          Metrics.set(metrics["liabilityInBtc"], liabilityInBtc)

          // Funding Account Balance
          const fundingAccountBalance = await dealer.getFundingAccountBalance()
          Metrics.set(
            metrics["fundingAccountBtcFreeBalance"],
            fundingAccountBalance.btcFreeBalance,
          )
          Metrics.set(
            metrics["fundingAccountBtcUsedBalance"],
            fundingAccountBalance.btcUsedBalance,
          )
          Metrics.set(
            metrics["fundingAccountBtcTotalBalance"],
            fundingAccountBalance.btcTotalBalance,
          )
          btcBalanceOnExchange += fundingAccountBalance.btcTotalBalance

          // Spot uPnl
          const openSpotQuantityInBtc = Math.abs(liabilityInBtc) + btcBalanceOnExchange
          const spotOpenPrice = Math.abs(liabilityInUsd) / openSpotQuantityInBtc
          const spotUPnlInUsd = (spotPrice - spotOpenPrice) * openSpotQuantityInBtc
          Metrics.set(metrics["spotUPnlInUsd"], spotUPnlInUsd)

          // Swap uPnl
          const swapOpenPrice = averageOpenPrice
          // TODO use contract face value
          const swapUPnlInUsd = 100.0 * swapPosInCt * (swapPrice / swapOpenPrice - 1.0)
          Metrics.set(metrics["swapUPnlInUsd"], swapUPnlInUsd)

          // Strategy uPnl
          const strategyUPnlInUsd = spotUPnlInUsd + swapUPnlInUsd
          Metrics.set(metrics["strategyUPnlInUsd"], strategyUPnlInUsd)

          // InFlight Transfers
          const inFlightTransfersMetrics = await dealer.getInFlightTransfersMetrics()
          Metrics.set(
            metrics["totalInFlightTransfersCount"],
            inFlightTransfersMetrics.totalInFlightTransfersCount,
          )
          Metrics.set(
            metrics["completedDepositCount"],
            inFlightTransfersMetrics.completedDepositCount,
          )
          Metrics.set(
            metrics["completedWithdrawalCount"],
            inFlightTransfersMetrics.completedWithdrawalCount,
          )
          Metrics.set(
            metrics["pendingDepositCount"],
            inFlightTransfersMetrics.pendingDepositCount,
          )
          Metrics.set(
            metrics["pendingWithdrawalCount"],
            inFlightTransfersMetrics.pendingWithdrawalCount,
          )

          // Trading Fees
          const tradingFeesMetrics = await dealer.getTradingFeesMetrics()
          Metrics.set(
            metrics["tradingFeesTotalInSats"],
            tradingFeesMetrics.tradingFeesTotalInSats,
          )
          Metrics.set(
            metrics["tradingFeesBuyInSats"],
            tradingFeesMetrics.tradingFeesBuyInSats,
          )
          Metrics.set(
            metrics["tradingFeesBuyCount"],
            tradingFeesMetrics.tradingFeesBuyCount,
          )
          Metrics.set(
            metrics["tradingFeesSellInSats"],
            tradingFeesMetrics.tradingFeesSellInSats,
          )
          Metrics.set(
            metrics["tradingFeesSellCount"],
            tradingFeesMetrics.tradingFeesSellCount,
          )

          // Funding Fees
          const fundingFeesMetrics = await dealer.getFundingFeesMetrics()
          Metrics.set(
            metrics["fundingFeesTotalInSats"],
            fundingFeesMetrics.fundingFeesTotalInSats,
          )
          Metrics.set(
            metrics["fundingFeesExpenseInSats"],
            fundingFeesMetrics.fundingFeesExpenseInSats,
          )
          Metrics.set(
            metrics["fundingFeesExpenseCount"],
            fundingFeesMetrics.fundingFeesExpenseCount,
          )
          Metrics.set(
            metrics["fundingFeesIncomeInSats"],
            fundingFeesMetrics.fundingFeesIncomeInSats,
          )
          Metrics.set(
            metrics["fundingFeesIncomeCount"],
            fundingFeesMetrics.fundingFeesIncomeCount,
          )

          // Funding Yields
          const fundingYieldMetrics = await dealer.getAnnualFundingYieldMetrics()
          Metrics.set(metrics["fundingYield1d"], fundingYieldMetrics.fundingYield1d)
          Metrics.set(metrics["fundingYield1W"], fundingYieldMetrics.fundingYield1W)
          Metrics.set(metrics["fundingYield2W"], fundingYieldMetrics.fundingYield2W)
          Metrics.set(metrics["fundingYield3W"], fundingYieldMetrics.fundingYield3W)
          Metrics.set(metrics["fundingYield1M"], fundingYieldMetrics.fundingYield1M)
          Metrics.set(metrics["fundingYield2M"], fundingYieldMetrics.fundingYield2M)
          Metrics.set(metrics["fundingYield3M"], fundingYieldMetrics.fundingYield3M)
          Metrics.set(metrics["fundingYield6M"], fundingYieldMetrics.fundingYield6M)
          Metrics.set(metrics["fundingYield1Y"], fundingYieldMetrics.fundingYield1Y)
          Metrics.set(metrics["fundingYield2Y"], fundingYieldMetrics.fundingYield2Y)
          Metrics.set(metrics["fundingYield3Y"], fundingYieldMetrics.fundingYield3Y)
          Metrics.set(metrics["fundingYield5Y"], fundingYieldMetrics.fundingYield5Y)

          // Is exchange up?
          Metrics.set(metrics["exchangeStatus"], await dealer.getExchangeStatus())

          // Realized Profit And Loss
          const strategyRPnlInSats =
            tradingFeesMetrics.tradingFeesTotalInSats +
            fundingFeesMetrics.fundingFeesTotalInSats
          Metrics.set(metrics["strategyRPnlInSats"], strategyRPnlInSats)
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          console.log(error)
          logger.error("Couldn't set dealer wallet metrics")
        }

        for (const metricName in metrics) {
          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.${metricName}`]: String(
              metrics[metricName].value,
            ),
          })
        }

        res.set("Content-Type", register.contentType)
        res.end(await register.metrics())
      },
    )
  })

  server.get("/healthz", async (req, res) => {
    res.send("OK")
  })

  const port = process.env.PORT || 3333
  logger.info(`Server listening to ${port}, metrics exposed on /metrics endpoint`)
  server.listen(port)
}
