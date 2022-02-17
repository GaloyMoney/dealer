import { ServerUnaryCall, sendUnaryData, Server, ServerCredentials } from "@grpc/grpc-js"

import { baseLogger } from "../../services/logger"

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

import { loop, lastBid, lastAsk } from "./price_fetcher"
import { SATS_PER_BTC, toCents, toCentsPerSatsRatio } from "../../utils"

export const CENTS_PER_USD = 100

export const usd2cents = (usd: number): UsdCents => {
  return toCents(Math.round(usd * CENTS_PER_USD))
}

export const cents2usd = (cents: UsdCents): number => {
  return cents / CENTS_PER_USD
}

export const main = async () => {
  //
  // Get and update data
  //
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

  const amountInSatoshis = call.request.getAmountInSatoshis()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis },
    "Received a GetCentsFromSatsForImmediateBuy({amountInSatoshis}) call",
  )
  response.setAmountInCents(lastBid)

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

  const amountInSatoshis = call.request.getAmountInSatoshis()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis },
    "Received a GetCentsFromSatsForImmediateSell({amountInSatoshis}) call",
  )
  response.setAmountInCents(lastAsk)

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

  const amountInSatoshis = call.request.getAmountInSatoshis()
  const timeInSeconds = call.request.getTimeInSeconds()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis, timeInSeconds },
    "Received a GetCentsFromSatsForFutureBuy({amountInSatoshis}, {timeInSeconds}) call",
  )
  response.setAmountInCents(lastBid)

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

  const amountInSatoshis = call.request.getAmountInSatoshis()
  const timeInSeconds = call.request.getTimeInSeconds()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis, timeInSeconds },
    "Received a GetCentsFromSatsForFutureSell({amountInSatoshis}, {timeInSeconds}) call",
  )
  response.setAmountInCents(lastBid)

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

  const amountInSatoshis = call.request.getAmountInCents()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis },
    "Received a GetSatsFromCentsForImmediateBuy({amountInSatoshis}) call",
  )
  response.setAmountInSatoshis(lastBid)

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

  const amountInSatoshis = call.request.getAmountInCents()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis },
    "Received a GetSatsFromCentsForImmediateSell({amountInSatoshis}) call",
  )
  response.setAmountInSatoshis(lastAsk)

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

  const amountInSatoshis = call.request.getAmountInCents()
  const timeInSeconds = call.request.getTimeInSeconds()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis, timeInSeconds },
    "Received a GetSatsFromCentsForFutureBuy({amountInSatoshis}, {timeInSeconds}) call",
  )
  response.setAmountInSatoshis(lastAsk)

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

  const amountInSatoshis = call.request.getAmountInCents()
  const timeInSeconds = call.request.getTimeInSeconds()
  // validate
  // convert to btc
  // use last price with calc'd spread
  baseLogger.info(
    { amountInSatoshis, timeInSeconds },
    "Received a GetSatsFromCentsForFutureSell({amountInSatoshis}, {timeInSeconds}) call",
  )
  response.setAmountInSatoshis(lastAsk)

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
  baseLogger.info(
    { lastAsk, lastBid },
    "Received a GetCentsPerSatsExchangeMidRate() call",
  )
  const lastMid = (lastAsk + lastBid) / 2
  response.setRatioInCentsPerSatoshis(
    toCentsPerSatsRatio((lastMid * CENTS_PER_USD) / SATS_PER_BTC),
  )

  callback(null, response)
}

function getServer() {
  const server = new Server()
  server.addService(PriceServiceService, {
    getCentsFromSatsForImmediateBuy,
    getCentsFromSatsForImmediateSell,

    getCentsFromSatsForFutureBuy,
    getCentsFromSatsForFutureSell,

    getSatsFromCentsForImmediateBuy,
    getSatsFromCentsForImmediateSell,

    getSatsFromCentsForFutureBuy,
    getSatsFromCentsForFutureSell,

    getCentsPerSatsExchangeMidRate,
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