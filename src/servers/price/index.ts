import { ServerUnaryCall, sendUnaryData, Server, ServerCredentials } from "@grpc/grpc-js"

import { baseLogger } from "../../services/logger"

import { PriceServiceService } from "./proto/services/price/v1/price_service_grpc_pb"
import {
  GetImmediateUsdPriceForBuyRequest,
  GetImmediateUsdPriceForBuyResponse,
  GetImmediateUsdPriceForSellRequest,
  GetImmediateUsdPriceForSellResponse,
  GetImmediateUsdPriceForOptionBuyRequest,
  GetImmediateUsdPriceForOptionBuyResponse,
  GetImmediateUsdPriceForOptionSellRequest,
  GetImmediateUsdPriceForOptionSellResponse,
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

function getImmediateUsdPriceForBuy(
  call: ServerUnaryCall<
    GetImmediateUsdPriceForBuyRequest,
    GetImmediateUsdPriceForBuyResponse
  >,
  callback: sendUnaryData<GetImmediateUsdPriceForBuyResponse>,
) {
  const response = new GetImmediateUsdPriceForBuyResponse()

  const amountInSatoshis = call.request.getAmountInSatoshis()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis },
    "Received a getImmediateUsdPriceForBuy({amountInSatoshis}) call",
  )
  response.setPriceInUsd(lastBid)

  callback(null, response)
}

function getImmediateUsdPriceForSell(
  call: ServerUnaryCall<
    GetImmediateUsdPriceForSellRequest,
    GetImmediateUsdPriceForSellResponse
  >,
  callback: sendUnaryData<GetImmediateUsdPriceForSellResponse>,
) {
  const response = new GetImmediateUsdPriceForSellResponse()

  const amountInSatoshis = call.request.getAmountInSatoshis()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis },
    "Received a getImmediateUsdPriceForSell({amountInSatoshis}) call",
  )
  response.setPriceInUsd(lastAsk)

  callback(null, response)
}

function getImmediateUsdPriceForOptionBuy(
  call: ServerUnaryCall<
    GetImmediateUsdPriceForOptionBuyRequest,
    GetImmediateUsdPriceForOptionBuyResponse
  >,
  callback: sendUnaryData<GetImmediateUsdPriceForOptionBuyResponse>,
) {
  const response = new GetImmediateUsdPriceForOptionBuyResponse()

  const amountInSatoshis = call.request.getAmountInSatoshis()
  const timeInMinutes = call.request.getTimeInMinutes()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis, timeInMinutes },
    "Received a getImmediateUsdPriceForOptionBuy({amountInSatoshis}, {timeInMinutes}) call",
  )
  response.setPriceInUsd(lastBid)

  callback(null, response)
}

function getImmediateUsdPriceForOptionSell(
  call: ServerUnaryCall<
    GetImmediateUsdPriceForOptionSellRequest,
    GetImmediateUsdPriceForOptionSellResponse
  >,
  callback: sendUnaryData<GetImmediateUsdPriceForOptionSellResponse>,
) {
  const response = new GetImmediateUsdPriceForOptionSellResponse()

  const amountInSatoshis = call.request.getAmountInSatoshis()
  const timeInMinutes = call.request.getTimeInMinutes()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis, timeInMinutes },
    "Received a getImmediateUsdPriceForOptionSell({amountInSatoshis}, {timeInMinutes}) call",
  )
  response.setPriceInUsd(lastAsk)

  callback(null, response)
}

function getServer() {
  const server = new Server()
  server.addService(PriceServiceService, {
    getImmediateUsdPriceForBuy,
    getImmediateUsdPriceForSell,
    getImmediateUsdPriceForOptionBuy,
    getImmediateUsdPriceForOptionSell,
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
