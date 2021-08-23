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
  FetchTickerResult,
  FetchWithdrawalsResult,
  FetchDepositsResult,
  FetchDepositsParameters,
  FetchWithdrawalsParameters,
} from "./ExchangeTradingType"
import assert from "assert"
import {
  ExchangeConfiguration,
  SupportedExchange,
  SupportedInstrument,
} from "./ExchangeConfiguration"
import { sat2btc } from "./utils"

export class FtxExchangeConfiguration implements ExchangeConfiguration {
  exchangeId: SupportedExchange
  instrumentId: SupportedInstrument

  constructor() {
    this.exchangeId = SupportedExchange.FTX
    this.instrumentId = SupportedInstrument.FTX_PERPETUAL_SWAP
  }

  fetchDepositAddressValidateInput(currency: string) {
    assert(currency === TradeCurrency.BTC, ApiError.UNSUPPORTED_CURRENCY)
  }
  fetchDepositAddressProcessApiResponse(response): FetchDepositAddressResult {
    assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(response.currency === TradeCurrency.BTC, ApiError.UNSUPPORTED_CURRENCY)
    assert(response.address, ApiError.UNSUPPORTED_ADDRESS)
    return {
      originalResponseAsIs: response,
      chain: SupportedChain.BTC_Bitcoin,
      currency: response.currency,
      address: response.address,
    }
  }

  fetchDepositsValidateInput(args: FetchDepositsParameters) {
    assert(args.address, ApiError.UNSUPPORTED_ADDRESS)
    assert(args.amountInSats, ApiError.NON_POSITIVE_QUANTITY)
    assert(args.amountInSats > 0, ApiError.NON_POSITIVE_QUANTITY)
  }
  fetchDepositsProcessApiResponse(
    args: FetchDepositsParameters,
    response,
  ): FetchDepositsResult {
    assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
    const amountInBtc = sat2btc(args.amountInSats)
    // We should receive an array of array of deposit objects
    // response = [[{}, ...], ...]
    // deposits = [{}, ...]
    // deposit = {}
    // Since we're looking for one specific entry, don't fail until we're done
    const result = {} as FetchDepositsResult
    response.forEach((deposits) => {
      deposits.forEach((deposit) => {
        if (
          deposit &&
          deposit.has("currency") &&
          deposit.currency === TradeCurrency.BTC &&
          deposit.has("address") &&
          deposit.address === args.address &&
          deposit.has("amount") &&
          deposit.amount === amountInBtc &&
          deposit.has("status")
        ) {
          result.originalResponseAsIs = deposit
          result.currency = deposit.currency
          result.address = deposit.address
          result.amount = deposit.amount
          result.status = deposit.status
        }
      })
    })
    assert(result, ApiError.UNSUPPORTED_API_RESPONSE)
    return result
  }

  withdrawValidateInput(args: WithdrawParameters) {
    assert(args, ApiError.MISSING_PARAMETERS)
    assert(args.currency === TradeCurrency.BTC, ApiError.UNSUPPORTED_CURRENCY)
    assert(args.quantity > 0, ApiError.NON_POSITIVE_QUANTITY)
    assert(args.address, ApiError.UNSUPPORTED_ADDRESS)
  }
  withdrawValidateApiResponse(response) {
    assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
    // assert(response.status) // we don't know enough to validate the status, TODO
  }

  fetchWithdrawalsValidateInput(args: FetchWithdrawalsParameters) {
    assert(args.address, ApiError.UNSUPPORTED_ADDRESS)
    assert(args.amountInSats, ApiError.NON_POSITIVE_QUANTITY)
    assert(args.amountInSats > 0, ApiError.NON_POSITIVE_QUANTITY)
  }
  fetchWithdrawalsProcessApiResponse(
    args: FetchWithdrawalsParameters,
    response,
  ): FetchWithdrawalsResult {
    assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
    const amountInBtc = sat2btc(args.amountInSats)
    // We should receive an array of array of withdrawal objects:
    // response = [[{}, ...], ...]
    // withdrawals = [{}, ...]
    // withdrawal = {}
    // Since we're looking for one specific entry, don't fail until we're done
    const result = {} as FetchWithdrawalsResult
    response.forEach((withdrawals) => {
      withdrawals.forEach((withdrawal) => {
        if (
          withdrawal &&
          withdrawal.has("currency") &&
          withdrawal.currency === TradeCurrency.BTC &&
          withdrawal.has("address") &&
          withdrawal.address === args.address &&
          withdrawal.has("amount") &&
          withdrawal.amount === amountInBtc &&
          withdrawal.has("status")
        ) {
          result.originalResponseAsIs = withdrawal
          result.currency = withdrawal.currency
          result.address = withdrawal.address
          result.amount = withdrawal.amount
          result.status = withdrawal.status
        }
      })
    })
    assert(result, ApiError.UNSUPPORTED_API_RESPONSE)
    return result
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
    // Implementation is to do nothing and let the call pass thru
    // versus throw and unsupported error if it is not (ex. okex)
    return
  }
  privateGetAccountProcessApiResponse(response): PrivateGetAccountResult {
    assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(response.result, ApiError.UNSUPPORTED_API_RESPONSE)
    const result = response.result
    const numberRegex = /-?(?=[1-9]|0(?!\d))\d+(\.\d+)?([eE][+-]?\d+)?/
    assert(typeof result.marginFraction === "string", ApiError.UNSUPPORTED_API_RESPONSE)
    assert.match(result.marginFraction, numberRegex, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(typeof result.collateral === "string", ApiError.UNSUPPORTED_API_RESPONSE)
    assert.match(result.collateral, numberRegex, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(
      typeof result.totalAccountValue === "string",
      ApiError.UNSUPPORTED_API_RESPONSE,
    )
    assert.match(result.totalAccountValue, numberRegex, ApiError.UNSUPPORTED_API_RESPONSE)

    const { netSize = 0 } = _.find(result.positions, {
      future: this.instrumentId,
    })

    return {
      originalResponseAsIs: response,
      marginFraction: result.marginFraction,
      netSize: netSize,
      collateral: result.collateral,
      totalAccountValue: result.totalAccountValue,
    }
  }

  /* eslint-disable */
  fetchBalanceValidateCall() {
    // Not supported
    throw new Error(ApiError.NOT_SUPPORTED)
  }
  fetchBalanceProcessApiResponse(response): FetchBalanceResult {
    // Not supported
    throw new Error(ApiError.NOT_SUPPORTED)
  }

  fetchPositionValidateInput(instrumentId: string) {
    // Not supported
    throw new Error(ApiError.NOT_SUPPORTED)
  }
  fetchPositionProcessApiResponse(response): FetchPositionResult {
    // Not supported
    throw new Error(ApiError.NOT_SUPPORTED)
  }
  /* eslint-enable */

  fetchTickerValidateInput(instrumentId: string) {
    assert(
      instrumentId === SupportedInstrument.FTX_PERPETUAL_SWAP,
      ApiError.UNSUPPORTED_INSTRUMENT,
    )
  }
  fetchTickerProcessApiResponse(response): FetchTickerResult {
    assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(response.last, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(typeof response.last === "number", ApiError.UNSUPPORTED_API_RESPONSE)

    return {
      originalResponseAsIs: response,
      lastBtcPriceInUsd: response.last,
    }
  }
}
