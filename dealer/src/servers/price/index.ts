import { ServerUnaryCall, sendUnaryData, Server, ServerCredentials } from "@grpc/grpc-js"

import { baseLogger } from "../../services/logger"

import {
  btc2sat,
  cents2usd,
  CENTS_PER_USD,
  sat2btc,
  SATS_PER_BTC,
  toCents,
  toCentsPerSatsRatio,
  toSats,
  toSeconds,
  usd2cents,
} from "../../utils"

import { yamlConfig } from "../../config"

import {
  addAttributesToCurrentSpan,
  SemanticAttributes,
  wrapToRunInSpan,
} from "../../services/tracing"

import { PriceServiceService } from "./proto/services/price/v1/price_service_grpc_pb"
import {
  GetCentsFromSatsForImmediateBuyRequest,
  GetCentsFromSatsForImmediateBuyResponse,
  GetCentsFromSatsForImmediateSellRequest,
  GetCentsFromSatsForImmediateSellResponse,
  GetCentsFromSatsForFutureBuyRequest,
  GetCentsFromSatsForFutureBuyResponse,
  GetCentsFromSatsForFutureSellRequest,
  GetCentsFromSatsForFutureSellResponse,
  GetSatsFromCentsForImmediateBuyRequest,
  GetSatsFromCentsForImmediateBuyResponse,
  GetSatsFromCentsForImmediateSellRequest,
  GetSatsFromCentsForImmediateSellResponse,
  GetSatsFromCentsForFutureBuyRequest,
  GetSatsFromCentsForFutureBuyResponse,
  GetSatsFromCentsForFutureSellRequest,
  GetSatsFromCentsForFutureSellResponse,
  GetCentsPerSatsExchangeMidRateRequest,
  GetCentsPerSatsExchangeMidRateResponse,
} from "./proto/services/price/v1/price_service_pb"

import { loop, lastBidInUsdPerBtc, lastAskInUsdPerBtc } from "./price_fetcher"

const fees = yamlConfig.fees

const logger = baseLogger.child({ module: "price-service" })

const updateMarketData = async () => {
  await loop()
}

function getCentsFromSatsForImmediateBuy(
  call: ServerUnaryCall<
    GetCentsFromSatsForImmediateBuyRequest,
    GetCentsFromSatsForImmediateBuyResponse
  >,
  callback: sendUnaryData<GetCentsFromSatsForImmediateBuyResponse>,
) {
  const response = new GetCentsFromSatsForImmediateBuyResponse()

  const amountInSats = call.request.getAmountInSatoshis()
  logger.info(
    { amountInSats },
    "Received a GetCentsFromSatsForImmediateBuy({amountInSats}) call",
  )

  // validate
  const amountInBtc = sat2btc(toSats(amountInSats))
  // use the bid as the maximum conversion rate
  // preferably lower by a % fee
  const currentFee = 1 - (fees.BASE_FEE + fees.IMMEDIATE_CONVERSION_SPREAD)
  const amountInCents = usd2cents(lastBidInUsdPerBtc * amountInBtc * currentFee)

  logger.info(
    { amountInSats, amountInCents },
    "Responding to GetCentsFromSatsForImmediateBuy({amountInSats}) call with {amountInCents}",
  )

  addAttributesToCurrentSpan({
    [`${SemanticAttributes.CODE_FUNCTION}.results.base_fee`]: String(fees.BASE_FEE),
    [`${SemanticAttributes.CODE_FUNCTION}.results.immediate_conversion_spread`]: String(
      fees.IMMEDIATE_CONVERSION_SPREAD,
    ),
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastAsk`]: String(lastAskInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastBid`]: String(lastBidInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.fx`]: String(lastBidInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.amountInSats`]: String(amountInSats),
    [`${SemanticAttributes.CODE_FUNCTION}.results.amountInCents`]: String(amountInCents),
  })

  response.setAmountInCents(amountInCents)
  callback(null, response)
}

function getCentsFromSatsForImmediateSell(
  call: ServerUnaryCall<
    GetCentsFromSatsForImmediateSellRequest,
    GetCentsFromSatsForImmediateSellResponse
  >,
  callback: sendUnaryData<GetCentsFromSatsForImmediateSellResponse>,
) {
  const response = new GetCentsFromSatsForImmediateSellResponse()

  const amountInSats = call.request.getAmountInSatoshis()
  logger.info(
    { amountInSats },
    "Received a GetCentsFromSatsForImmediateSell({amountInSats}) call",
  )

  // validate
  const amountInBtc = sat2btc(toSats(amountInSats))
  // use the ask as the maximum conversion rate
  // preferably higher by a % fee
  const currentFee = 1 + (fees.BASE_FEE + fees.IMMEDIATE_CONVERSION_SPREAD)
  const amountInCents = usd2cents(lastAskInUsdPerBtc * amountInBtc * currentFee)

  logger.info(
    { amountInSats, amountInCents },
    "Responding to GetCentsFromSatsForImmediateSell({amountInSats}) call with {amountInCents}",
  )

  addAttributesToCurrentSpan({
    [`${SemanticAttributes.CODE_FUNCTION}.results.base_fee`]: String(fees.BASE_FEE),
    [`${SemanticAttributes.CODE_FUNCTION}.results.immediate_conversion_spread`]: String(
      fees.IMMEDIATE_CONVERSION_SPREAD,
    ),
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastAsk`]: String(lastAskInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastBid`]: String(lastBidInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.fx`]: String(lastAskInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.amountInSats`]: String(amountInSats),
    [`${SemanticAttributes.CODE_FUNCTION}.results.amountInCents`]: String(amountInCents),
  })

  response.setAmountInCents(amountInCents)
  callback(null, response)
}

function getCentsFromSatsForFutureBuy(
  call: ServerUnaryCall<
    GetCentsFromSatsForFutureBuyRequest,
    GetCentsFromSatsForFutureBuyResponse
  >,
  callback: sendUnaryData<GetCentsFromSatsForFutureBuyResponse>,
) {
  const response = new GetCentsFromSatsForFutureBuyResponse()

  const amountInSats = call.request.getAmountInSatoshis()
  const timeInSec = call.request.getTimeInSeconds()
  logger.info(
    { amountInSats, timeInSec },
    "Received a GetCentsFromSatsForFutureBuy({amountInSats}, {timeInSec}) call",
  )

  // validate
  const amountInBtc = sat2btc(toSats(amountInSats))
  const timeInSeconds = toSeconds(timeInSec)
  // use the bid as the maximum conversion rate
  // preferably lower by a % fee
  const currentFee = 1 - (fees.BASE_FEE + fees.DELAYED_CONVERSION_SPREAD)
  const amountInCents = usd2cents(lastBidInUsdPerBtc * amountInBtc * currentFee)

  logger.info(
    { amountInSats, timeInSeconds, amountInCents },
    "Responding to GetCentsFromSatsForFutureBuy({amountInSats}, {timeInSeconds}) call with {amountInCents}",
  )

  addAttributesToCurrentSpan({
    [`${SemanticAttributes.CODE_FUNCTION}.results.base_fee`]: String(fees.BASE_FEE),
    [`${SemanticAttributes.CODE_FUNCTION}.results.delayed_conversion_spread`]: String(
      fees.DELAYED_CONVERSION_SPREAD,
    ),
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastAsk`]: String(lastAskInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastBid`]: String(lastBidInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.fx`]: String(lastBidInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.amountInSats`]: String(amountInSats),
    [`${SemanticAttributes.CODE_FUNCTION}.results.timeInSeconds`]: String(timeInSeconds),
    [`${SemanticAttributes.CODE_FUNCTION}.results.amountInCents`]: String(amountInCents),
  })

  response.setAmountInCents(amountInCents)
  callback(null, response)
}

function getCentsFromSatsForFutureSell(
  call: ServerUnaryCall<
    GetCentsFromSatsForFutureSellRequest,
    GetCentsFromSatsForFutureSellResponse
  >,
  callback: sendUnaryData<GetCentsFromSatsForFutureSellResponse>,
) {
  const response = new GetCentsFromSatsForFutureSellResponse()

  const amountInSats = call.request.getAmountInSatoshis()
  const timeInSec = call.request.getTimeInSeconds()
  logger.info(
    { amountInSats, timeInSec },
    "Received a GetCentsFromSatsForFutureSell({amountInSats}, {timeInSec}) call",
  )

  // validate
  const amountInBtc = sat2btc(toSats(amountInSats))
  const timeInSeconds = toSeconds(timeInSec)
  // use the ask as the maximum conversion rate
  // preferably higher by a % fee
  const currentFee = 1 + (fees.BASE_FEE + fees.DELAYED_CONVERSION_SPREAD)
  const amountInCents = usd2cents(lastAskInUsdPerBtc * amountInBtc * currentFee)

  logger.info(
    { amountInSats, timeInSeconds, amountInCents },
    "Responding to GetCentsFromSatsForFutureSell({amountInSats}, {timeInSeconds}) call with {amountInCents}",
  )

  addAttributesToCurrentSpan({
    [`${SemanticAttributes.CODE_FUNCTION}.results.base_fee`]: String(fees.BASE_FEE),
    [`${SemanticAttributes.CODE_FUNCTION}.results.delayed_conversion_spread`]: String(
      fees.DELAYED_CONVERSION_SPREAD,
    ),
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastAsk`]: String(lastAskInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastBid`]: String(lastBidInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.fx`]: String(lastAskInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.amountInSats`]: String(amountInSats),
    [`${SemanticAttributes.CODE_FUNCTION}.results.timeInSeconds`]: String(timeInSeconds),
    [`${SemanticAttributes.CODE_FUNCTION}.results.amountInCents`]: String(amountInCents),
  })

  response.setAmountInCents(amountInCents)
  callback(null, response)
}

function getSatsFromCentsForImmediateBuy(
  call: ServerUnaryCall<
    GetSatsFromCentsForImmediateBuyRequest,
    GetSatsFromCentsForImmediateBuyResponse
  >,
  callback: sendUnaryData<GetSatsFromCentsForImmediateBuyResponse>,
) {
  const response = new GetSatsFromCentsForImmediateBuyResponse()

  const amountInCents = call.request.getAmountInCents()
  logger.info(
    { amountInCents },
    "Received a GetSatsFromCentsForImmediateBuy({amountInCents}) call",
  )

  // validate
  const amountInUsd = cents2usd(toCents(amountInCents))
  // use the ask as the maximum conversion rate
  // preferably higher by a % fee
  const currentFee = 1 + (fees.BASE_FEE + fees.IMMEDIATE_CONVERSION_SPREAD)
  const amountInSats = btc2sat(amountInUsd / (lastAskInUsdPerBtc * currentFee))

  logger.info(
    { amountInCents, amountInSats },
    "Responding to GetSatsFromCentsForImmediateBuy({amountInCents}) call with {amountInSats}",
  )

  addAttributesToCurrentSpan({
    [`${SemanticAttributes.CODE_FUNCTION}.results.base_fee`]: String(fees.BASE_FEE),
    [`${SemanticAttributes.CODE_FUNCTION}.results.immediate_conversion_spread`]: String(
      fees.IMMEDIATE_CONVERSION_SPREAD,
    ),
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastAsk`]: String(lastAskInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastBid`]: String(lastBidInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.fx`]: String(lastAskInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.amountInSats`]: String(amountInSats),
    [`${SemanticAttributes.CODE_FUNCTION}.results.amountInCents`]: String(amountInCents),
  })

  response.setAmountInSatoshis(amountInSats)
  callback(null, response)
}

function getSatsFromCentsForImmediateSell(
  call: ServerUnaryCall<
    GetSatsFromCentsForImmediateSellRequest,
    GetSatsFromCentsForImmediateSellResponse
  >,
  callback: sendUnaryData<GetSatsFromCentsForImmediateSellResponse>,
) {
  const response = new GetSatsFromCentsForImmediateSellResponse()

  const amountInCents = call.request.getAmountInCents()
  logger.info(
    { amountInCents },
    "Received a GetSatsFromCentsForImmediateSell({amountInCents}) call",
  )

  // validate
  const amountInUsd = cents2usd(toCents(amountInCents))
  // use the bid as the maximum conversion rate
  // preferably lower by a % fee
  const currentFee = 1 - (fees.BASE_FEE + fees.IMMEDIATE_CONVERSION_SPREAD)
  const amountInSats = btc2sat(amountInUsd / (lastBidInUsdPerBtc * currentFee))

  logger.info(
    { amountInCents, amountInSats },
    "Responding to GetSatsFromCentsForImmediateSell({amountInCents}) call with {amountInSats}",
  )

  addAttributesToCurrentSpan({
    [`${SemanticAttributes.CODE_FUNCTION}.results.base_fee`]: String(fees.BASE_FEE),
    [`${SemanticAttributes.CODE_FUNCTION}.results.immediate_conversion_spread`]: String(
      fees.IMMEDIATE_CONVERSION_SPREAD,
    ),
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastAsk`]: String(lastAskInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastBid`]: String(lastBidInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.fx`]: String(lastBidInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.amountInSats`]: String(amountInSats),
    [`${SemanticAttributes.CODE_FUNCTION}.results.amountInCents`]: String(amountInCents),
  })

  response.setAmountInSatoshis(amountInSats)
  callback(null, response)
}

function getSatsFromCentsForFutureBuy(
  call: ServerUnaryCall<
    GetSatsFromCentsForFutureBuyRequest,
    GetSatsFromCentsForFutureBuyResponse
  >,
  callback: sendUnaryData<GetSatsFromCentsForFutureBuyResponse>,
) {
  const response = new GetSatsFromCentsForFutureBuyResponse()

  const amountInCents = call.request.getAmountInCents()
  const timeInSec = call.request.getTimeInSeconds()
  logger.info(
    { amountInCents, timeInSec },
    "Received a GetSatsFromCentsForFutureBuy({amountInCents}, {timeInSec}) call",
  )

  // validate
  const amountInUsd = cents2usd(toCents(amountInCents))
  const timeInSeconds = toSeconds(timeInSec)
  // use the ask as the maximum conversion rate
  // preferably higher by a % fee
  const currentFee = 1 + (fees.BASE_FEE + fees.DELAYED_CONVERSION_SPREAD)
  const amountInSats = btc2sat(amountInUsd / (lastAskInUsdPerBtc * currentFee))

  logger.info(
    { amountInCents, timeInSeconds, amountInSats },
    "Responding to GetSatsFromCentsForFutureBuy({amountInCents}, {timeInSeconds}) call with {amountInSats}",
  )

  addAttributesToCurrentSpan({
    [`${SemanticAttributes.CODE_FUNCTION}.results.base_fee`]: String(fees.BASE_FEE),
    [`${SemanticAttributes.CODE_FUNCTION}.results.delayed_conversion_spread`]: String(
      fees.DELAYED_CONVERSION_SPREAD,
    ),
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastAsk`]: String(lastAskInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastBid`]: String(lastBidInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.fx`]: String(lastAskInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.amountInSats`]: String(amountInSats),
    [`${SemanticAttributes.CODE_FUNCTION}.results.timeInSeconds`]: String(timeInSeconds),
    [`${SemanticAttributes.CODE_FUNCTION}.results.amountInCents`]: String(amountInCents),
  })

  response.setAmountInSatoshis(amountInSats)
  callback(null, response)
}

function getSatsFromCentsForFutureSell(
  call: ServerUnaryCall<
    GetSatsFromCentsForFutureSellRequest,
    GetSatsFromCentsForFutureSellResponse
  >,
  callback: sendUnaryData<GetSatsFromCentsForFutureSellResponse>,
) {
  const response = new GetSatsFromCentsForFutureSellResponse()

  const amountInCents = call.request.getAmountInCents()
  const timeInSec = call.request.getTimeInSeconds()
  logger.info(
    { amountInCents, timeInSec },
    "Received a GetSatsFromCentsForFutureSell({amountInCents}, {timeInSec}) call",
  )

  // validate
  const amountInUsd = cents2usd(toCents(amountInCents))
  const timeInSeconds = toSeconds(timeInSec)
  // use the bid as the maximum conversion rate
  // preferably lower by a % fee
  const currentFee = 1 - (fees.BASE_FEE + fees.DELAYED_CONVERSION_SPREAD)
  const amountInSats = btc2sat(amountInUsd / (lastBidInUsdPerBtc * currentFee))

  logger.info(
    { amountInCents, timeInSeconds, amountInSats },
    "Responding to GetSatsFromCentsForFutureSell({amountInCents}, {timeInSeconds}) call with {amountInSats}",
  )

  addAttributesToCurrentSpan({
    [`${SemanticAttributes.CODE_FUNCTION}.results.base_fee`]: String(fees.BASE_FEE),
    [`${SemanticAttributes.CODE_FUNCTION}.results.delayed_conversion_spread`]: String(
      fees.DELAYED_CONVERSION_SPREAD,
    ),
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastAsk`]: String(lastAskInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastBid`]: String(lastBidInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.fx`]: String(lastBidInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.amountInSats`]: String(amountInSats),
    [`${SemanticAttributes.CODE_FUNCTION}.results.timeInSeconds`]: String(timeInSeconds),
    [`${SemanticAttributes.CODE_FUNCTION}.results.amountInCents`]: String(amountInCents),
  })

  response.setAmountInSatoshis(amountInSats)
  callback(null, response)
}

function getCentsPerSatsExchangeMidRate(
  call: ServerUnaryCall<
    GetCentsPerSatsExchangeMidRateRequest,
    GetCentsPerSatsExchangeMidRateResponse
  >,
  callback: sendUnaryData<GetCentsPerSatsExchangeMidRateResponse>,
) {
  const response = new GetCentsPerSatsExchangeMidRateResponse()
  logger.info(
    { lastAsk: lastAskInUsdPerBtc, lastBid: lastBidInUsdPerBtc },
    "Received a GetCentsPerSatsExchangeMidRate() call",
  )
  const lastMid = (lastAskInUsdPerBtc + lastBidInUsdPerBtc) / 2
  response.setRatioInCentsPerSatoshis(
    toCentsPerSatsRatio((lastMid * CENTS_PER_USD) / SATS_PER_BTC),
  )

  addAttributesToCurrentSpan({
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastAsk`]: String(lastAskInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastBid`]: String(lastBidInUsdPerBtc),
    [`${SemanticAttributes.CODE_FUNCTION}.results.lastMid`]: String(lastMid),
  })

  callback(null, response)
}

function getServer() {
  const server = new Server()
  server.addService(PriceServiceService, {
    getCentsFromSatsForImmediateBuy: wrapToRunInSpan({
      namespace: "app.getCentsFromSatsForImmediateBuy",
      fn: getCentsFromSatsForImmediateBuy,
    }),
    getCentsFromSatsForImmediateSell: wrapToRunInSpan({
      namespace: "app.getCentsFromSatsForImmediateSell",
      fn: getCentsFromSatsForImmediateSell,
    }),

    getCentsFromSatsForFutureBuy: wrapToRunInSpan({
      namespace: "app.getCentsFromSatsForFutureBuy",
      fn: getCentsFromSatsForFutureBuy,
    }),
    getCentsFromSatsForFutureSell: wrapToRunInSpan({
      namespace: "app.getCentsFromSatsForFutureSell",
      fn: getCentsFromSatsForFutureSell,
    }),

    getSatsFromCentsForImmediateBuy: wrapToRunInSpan({
      namespace: "app.getSatsFromCentsForImmediateBuy",
      fn: getSatsFromCentsForImmediateBuy,
    }),
    getSatsFromCentsForImmediateSell: wrapToRunInSpan({
      namespace: "app.getSatsFromCentsForImmediateSell",
      fn: getSatsFromCentsForImmediateSell,
    }),

    getSatsFromCentsForFutureBuy: wrapToRunInSpan({
      namespace: "app.getSatsFromCentsForFutureBuy",
      fn: getSatsFromCentsForFutureBuy,
    }),
    getSatsFromCentsForFutureSell: wrapToRunInSpan({
      namespace: "app.getSatsFromCentsForFutureSell",
      fn: getSatsFromCentsForFutureSell,
    }),

    getCentsPerSatsExchangeMidRate: wrapToRunInSpan({
      namespace: "app.getCentsPerSatsExchangeMidRate",
      fn: getCentsPerSatsExchangeMidRate,
    }),
  })
  return server
}

export const priceService = async () => {
  const serverPort = process.env.PRICE_SERVER_PORT ?? "50055"
  const routeServer = getServer()
  routeServer.bindAsync(
    `0.0.0.0:${serverPort}`,
    ServerCredentials.createInsecure(),
    () => {
      logger.info(`Price Service running on port ${serverPort}`)
      updateMarketData()
      routeServer.start()
    },
  )
}
