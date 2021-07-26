import _ from "lodash"
import {
  FetchDepositAddressResult,
  WithdrawParameters,
  CreateOrderParameters,
  SupportedChain,
  TradeCurrency,
  TradeSide,
  ApiError,
  OrderStatus,
  PrivateGetAccountResult,
  FetchBalanceResult,
  FetchPositionResult,
} from "./ExchangeTradingType"
import assert from "assert"
import {
  ExchangeConfiguration,
  SupportedExchange,
  SupportedInstrument,
} from "./ExchangeConfiguration"

export class OkexExchangeConfiguration implements ExchangeConfiguration {
  exchangeId: SupportedExchange
  instrumentId: SupportedInstrument

  constructor() {
    this.exchangeId = SupportedExchange.OKEX5
    this.instrumentId = SupportedInstrument.OKEX_PERPETUAL_SWAP
  }

  fetchDepositAddressValidateInput(currency: string) {
    assert(currency === TradeCurrency.BTC, ApiError.UNSUPPORTED_CURRENCY)
  }
  fetchDepositAddressProcessApiResponse(response): FetchDepositAddressResult {
    assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(response.data, ApiError.UNSUPPORTED_API_RESPONSE)
    const { ccy, addr, chain } = _.find(response.data, {
      chain: SupportedChain.BTC_Bitcoin,
    })
    assert(ccy === TradeCurrency.BTC, ApiError.UNSUPPORTED_CURRENCY)
    assert(addr, ApiError.UNSUPPORTED_ADDRESS)
    assert(chain === SupportedChain.BTC_Bitcoin, ApiError.UNSUPPORTED_CURRENCY)
    return {
      originalResponseAsIs: response,
      chain: chain,
      currency: ccy,
      address: addr,
    }
  }

  withdrawValidateInput(args: WithdrawParameters) {
    assert(args, ApiError.MISSING_PARAMETERS)
    assert(args.currency === TradeCurrency.BTC, ApiError.UNSUPPORTED_CURRENCY)
    assert(args.quantity > 0, ApiError.NON_POSITIVE_QUANTITY)
    assert(args.address, ApiError.UNSUPPORTED_ADDRESS)
  }
  withdrawValidateApiResponse(response) {
    assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
  }

  createMarketOrderValidateInput(args: CreateOrderParameters) {
    assert(args, ApiError.MISSING_PARAMETERS)
    assert(
      args.side === TradeSide.Buy || args.side === TradeSide.Sell,
      ApiError.INVALID_TRADE_SIDE,
    )
    assert(args.quantity > 0, ApiError.NON_POSITIVE_QUANTITY)
  }
  createMarketOrderValidateApiResponse(response) {
    assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(response.id, ApiError.MISSING_ORDER_ID)
  }

  fetchOrderValidateInput(id: string) {
    assert(id, ApiError.MISSING_PARAMETERS)
  }
  fetchOrderValidateApiResponse(response) {
    assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(response.status as OrderStatus, ApiError.UNSUPPORTED_API_RESPONSE)
  }

  privateGetAccountValidateCall() {
    // Not supported
    throw new Error(ApiError.NOT_SUPPORTED)
  }
  /* eslint-disable */
  privateGetAccountProcessApiResponse(response): PrivateGetAccountResult {
    // Not supported
    throw new Error(ApiError.NOT_SUPPORTED)
  }
  /* eslint-enable */

  fetchBalanceValidateCall() {
    // Implementation is to do nothing and let the call pass thru
    // versus throw and unsupported error if it is not (ex. okex)
    return
  }
  fetchBalanceProcessApiResponse(response): FetchBalanceResult {
    assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(response?.info?.data?.[0]?.totalEq, ApiError.MISSING_ACCOUNT_VALUE)
    const numberRegex = /-?(?=[1-9]|0(?!\d))\d+(\.\d+)?([eE][+-]?\d+)?/
    assert(
      typeof response?.info?.data?.[0]?.totalEq === "string",
      ApiError.MISSING_ACCOUNT_VALUE,
    )
    assert.match(
      response?.info?.data?.[0]?.totalEq,
      numberRegex,
      ApiError.MISSING_ACCOUNT_VALUE,
    )

    return {
      originalResponseAsIs: response,
      totalEq: response.info.data[0].totalEq,
    }
  }

  fetchPositionValidateInput(instrumentId: string) {
    assert(
      instrumentId === SupportedInstrument.OKEX_PERPETUAL_SWAP,
      ApiError.UNSUPPORTED_INSTRUMENT,
    )
  }
  fetchPositionProcessApiResponse(response): FetchPositionResult {
    assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(response.last, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(response.notionalUsd, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(response.margin, ApiError.UNSUPPORTED_API_RESPONSE)
    const numberRegex = /-?(?=[1-9]|0(?!\d))\d+(\.\d+)?([eE][+-]?\d+)?/
    assert(typeof response.last === "string", ApiError.UNSUPPORTED_API_RESPONSE)
    assert.match(response.last, numberRegex, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(typeof response.notionalUsd === "string", ApiError.UNSUPPORTED_API_RESPONSE)
    assert.match(response.notionalUsd, numberRegex, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(typeof response.margin === "string", ApiError.UNSUPPORTED_API_RESPONSE)
    assert.match(response.margin, numberRegex, ApiError.UNSUPPORTED_API_RESPONSE)

    return {
      originalResponseAsIs: response,
      last: response.last,
      notionalUsd: response.notionalUsd,
      margin: response.margin,
    }
  }
}
