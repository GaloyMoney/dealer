import { credentials, ServiceError } from "@grpc/grpc-js"
import { PriceServiceClient } from "./proto/services/price/v1/price_service_grpc_pb"
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

function buyRequestCallback(
  error: ServiceError | null,
  response: GetImmediateUsdPriceForBuyResponse,
) {
  if (error) {
    console.error({ err: error })
    return
  }
  console.info(`GetImmediateUsdPriceForBuy: ${response.getPriceInUsd()}`)
}

function sellRequestCallback(
  error: ServiceError | null,
  response: GetImmediateUsdPriceForSellResponse,
) {
  if (error) {
    console.error({ err: error })
    return
  }
  console.info(`GetImmediateUsdPriceForSell: ${response.getPriceInUsd()}`)
}

function optionBuyRequestCallback(
  error: ServiceError | null,
  response: GetImmediateUsdPriceForOptionBuyResponse,
) {
  if (error) {
    console.error({ err: error })
    return
  }
  console.info(`GetImmediateUsdPriceForOptionBuy: ${response.getPriceInUsd()}`)
}

function optionSellRequestCallback(
  error: ServiceError | null,
  response: GetImmediateUsdPriceForOptionSellResponse,
) {
  if (error) {
    console.error({ err: error })
    return
  }
  console.info(`GetImmediateUsdPriceForOptionSell: ${response.getPriceInUsd()}`)
}

const serverPort = process.env.PRICE_SERVER_PORT ?? "50055"
const client = new PriceServiceClient(
  `localhost:${serverPort}`,
  credentials.createInsecure(),
)

client.getImmediateUsdPriceForBuy(
  new GetImmediateUsdPriceForBuyRequest().setAmountInSatoshis(100),
  buyRequestCallback,
)
client.getImmediateUsdPriceForSell(
  new GetImmediateUsdPriceForSellRequest().setAmountInSatoshis(100),
  sellRequestCallback,
)
client.getImmediateUsdPriceForOptionBuy(
  new GetImmediateUsdPriceForOptionBuyRequest()
    .setAmountInSatoshis(100)
    .setTimeInMinutes(2),
  optionBuyRequestCallback,
)
client.getImmediateUsdPriceForOptionSell(
  new GetImmediateUsdPriceForOptionSellRequest()
    .setAmountInSatoshis(100)
    .setTimeInMinutes(2),
  optionSellRequestCallback,
)
