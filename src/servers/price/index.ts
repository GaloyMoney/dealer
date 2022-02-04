import { ServerUnaryCall, sendUnaryData, Server, ServerCredentials } from "@grpc/grpc-js"

import { baseLogger } from "../../services/logger"

import { PriceServiceService } from "./proto/services/price/v1/price_service_grpc_pb"
import {
  GetExchangeRateForImmediateUsdBuyRequest,
  GetExchangeRateForImmediateUsdBuyResponse,
  GetExchangeRateForImmediateUsdSellRequest,
  GetExchangeRateForImmediateUsdSellResponse,
  GetExchangeRateForFutureUsdBuyRequest,
  GetExchangeRateForFutureUsdBuyResponse,
  GetExchangeRateForFutureUsdSellRequest,
  GetExchangeRateForFutureUsdSellResponse,
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
  response.setPriceInUsd(lastBid)

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
  response.setPriceInSatoshis(lastAsk)

  callback(null, response)
}

function getExchangeRateForFutureUsdBuy(
  call: ServerUnaryCall<
    GetExchangeRateForFutureUsdBuyRequest,
    GetExchangeRateForFutureUsdBuyResponse
  >,
  callback: sendUnaryData<GetExchangeRateForFutureUsdBuyResponse>,
) {
  const response = new GetExchangeRateForFutureUsdBuyResponse()

  const amountInSatoshis = call.request.getAmountInSatoshis()
  const timeInSeconds = call.request.getTimeInSeconds()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis, timeInSeconds },
    "Received a GetExchangeRateForFutureUsdBuy({amountInSatoshis}, {timeInSeconds}) call",
  )
  response.setPriceInUsd(lastBid)

  callback(null, response)
}

function getExchangeRateForFutureUsdSell(
  call: ServerUnaryCall<
    GetExchangeRateForFutureUsdSellRequest,
    GetExchangeRateForFutureUsdSellResponse
  >,
  callback: sendUnaryData<GetExchangeRateForFutureUsdSellResponse>,
) {
  const response = new GetExchangeRateForFutureUsdSellResponse()

  const amountInSatoshis = call.request.getAmountInUsd()
  const timeInSeconds = call.request.getTimeInSeconds()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis, timeInSeconds },
    "Received a GetExchangeRateForFutureUsdSell({amountInSatoshis}, {timeInSeconds}) call",
  )
  response.setPriceInSatoshis(lastAsk)

  callback(null, response)
}

function getServer() {
  const server = new Server()
  server.addService(PriceServiceService, {
    getExchangeRateForImmediateUsdBuy,
    getExchangeRateForImmediateUsdSell,
    getExchangeRateForFutureUsdBuy,
    getExchangeRateForFutureUsdSell,
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
