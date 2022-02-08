import { ServerUnaryCall, sendUnaryData, Server, ServerCredentials } from "@grpc/grpc-js"

import { baseLogger } from "../../services/logger"

import { PriceServiceService } from "./proto/services/price/v1/price_service_grpc_pb"
import {
  GetExchangeRateForImmediateUsdBuyRequest,
  GetExchangeRateForImmediateUsdBuyResponse,
  GetExchangeRateForImmediateUsdBuyFromCentsRequest,
  GetExchangeRateForImmediateUsdBuyFromCentsResponse,
  GetExchangeRateForImmediateUsdSellRequest,
  GetExchangeRateForImmediateUsdSellResponse,
  GetExchangeRateForImmediateUsdSellFromSatoshisRequest,
  GetExchangeRateForImmediateUsdSellFromSatoshisResponse,
  GetQuoteRateForFutureUsdBuyRequest,
  GetQuoteRateForFutureUsdBuyResponse,
  GetQuoteRateForFutureUsdSellRequest,
  GetQuoteRateForFutureUsdSellResponse,
} from "./proto/services/price/v1/price_service_pb"
// import {
//   PriceServiceError,
//   UnknownPriceServiceError,
//   PriceNotAvailableError,
// } from "@domain/price"

// import { SATS_PER_BTC } from "@domain/bitcoin"

import { loop, lastBid, lastAsk } from "./price_fetcher"

export const main = async () => {
  //
  // Get and update data
  //
  await loop()
}

function getExchangeRateForImmediateUsdBuy(
  call: ServerUnaryCall<
    GetExchangeRateForImmediateUsdBuyRequest,
    GetExchangeRateForImmediateUsdBuyResponse
  >,
  callback: sendUnaryData<GetExchangeRateForImmediateUsdBuyResponse>,
) {
  const response = new GetExchangeRateForImmediateUsdBuyResponse()

  const amountInSatoshis = call.request.getAmountInSatoshis()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis },
    "Received a GetExchangeRateForImmediateUsdBuy({amountInSatoshis}) call",
  )
  response.setAmountInUsd(lastBid)

  callback(null, response)
}

function getExchangeRateForImmediateUsdBuyFromCents(
  call: ServerUnaryCall<
    GetExchangeRateForImmediateUsdBuyFromCentsRequest,
    GetExchangeRateForImmediateUsdBuyFromCentsResponse
  >,
  callback: sendUnaryData<GetExchangeRateForImmediateUsdBuyFromCentsResponse>,
) {
  const response = new GetExchangeRateForImmediateUsdBuyFromCentsResponse()

  const amountInSatoshis = call.request.getAmountInCents()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis },
    "Received a GetExchangeRateForImmediateUsdBuyFromCents({amountInSatoshis}) call",
  )
  response.setAmountInSatoshis(lastBid)

  callback(null, response)
}

function getExchangeRateForImmediateUsdSell(
  call: ServerUnaryCall<
    GetExchangeRateForImmediateUsdSellRequest,
    GetExchangeRateForImmediateUsdSellResponse
  >,
  callback: sendUnaryData<GetExchangeRateForImmediateUsdSellResponse>,
) {
  const response = new GetExchangeRateForImmediateUsdSellResponse()

  const amountInSatoshis = call.request.getAmountInUsd()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis },
    "Received a GetExchangeRateForImmediateUsdSell({amountInSatoshis}) call",
  )
  response.setAmountInSatoshis(lastAsk)

  callback(null, response)
}

function getExchangeRateForImmediateUsdSellFromSatoshis(
  call: ServerUnaryCall<
    GetExchangeRateForImmediateUsdSellFromSatoshisRequest,
    GetExchangeRateForImmediateUsdSellFromSatoshisResponse
  >,
  callback: sendUnaryData<GetExchangeRateForImmediateUsdSellFromSatoshisResponse>,
) {
  const response = new GetExchangeRateForImmediateUsdSellFromSatoshisResponse()

  const amountInSatoshis = call.request.getAmountInSatoshis()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis },
    "Received a GetExchangeRateForImmediateUsdSellFromSatoshis({amountInSatoshis}) call",
  )
  response.setAmountInUsd(lastAsk)

  callback(null, response)
}

function getQuoteRateForFutureUsdBuy(
  call: ServerUnaryCall<
    GetQuoteRateForFutureUsdBuyRequest,
    GetQuoteRateForFutureUsdBuyResponse
  >,
  callback: sendUnaryData<GetQuoteRateForFutureUsdBuyResponse>,
) {
  const response = new GetQuoteRateForFutureUsdBuyResponse()

  const amountInSatoshis = call.request.getAmountInSatoshis()
  const timeInSeconds = call.request.getTimeInSeconds()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis, timeInSeconds },
    "Received a GetQuoteRateForFutureUsdBuy({amountInSatoshis}, {timeInSeconds}) call",
  )
  response.setAmountInUsd(lastBid)

  callback(null, response)
}

function getQuoteRateForFutureUsdSell(
  call: ServerUnaryCall<
    GetQuoteRateForFutureUsdSellRequest,
    GetQuoteRateForFutureUsdSellResponse
  >,
  callback: sendUnaryData<GetQuoteRateForFutureUsdSellResponse>,
) {
  const response = new GetQuoteRateForFutureUsdSellResponse()

  const amountInSatoshis = call.request.getAmountInUsd()
  const timeInSeconds = call.request.getTimeInSeconds()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis, timeInSeconds },
    "Received a GetQuoteRateForFutureUsdSell({amountInSatoshis}, {timeInSeconds}) call",
  )
  response.setAmountInSatoshis(lastAsk)

  callback(null, response)
}

function getServer() {
  const server = new Server()
  server.addService(PriceServiceService, {
    getExchangeRateForImmediateUsdBuy,
    getExchangeRateForImmediateUsdBuyFromCents,
    getExchangeRateForImmediateUsdSell,
    getExchangeRateForImmediateUsdSellFromSatoshis,
    getQuoteRateForFutureUsdBuy,
    getQuoteRateForFutureUsdSell,
  })
  return server
}

const serverPort = process.env.PRICE_SERVER_PORT ?? "50055"
const routeServer = getServer()
routeServer.bindAsync(`0.0.0.0:${serverPort}`, ServerCredentials.createInsecure(), () => {
  console.info(`Price server running on port ${serverPort}`)
  main()
  routeServer.start()
})
