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
  FetchDepositsResult,
  FetchWithdrawalsResult,
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
    let success = false
    response.forEach((deposits) => {
      deposits.forEach((deposit) => {
        if (
          deposit &&
          "currency" in deposit &&
          deposit.currency === TradeCurrency.BTC &&
          "address" in deposit &&
          deposit.address === args.address &&
          "amount" in deposit &&
          deposit.amount === amountInBtc &&
          "status" in deposit
        ) {
          success = true
          result.currency = deposit.currency
          result.address = deposit.address
          result.amount = deposit.amount
          result.status = deposit.status
        }
      })
    })
    assert(success, ApiError.UNSUPPORTED_API_RESPONSE)
    result.originalResponseAsIs = response
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
    assert(response.id, ApiError.UNSUPPORTED_API_RESPONSE)
    // OKEX specific
    assert(response.info.code === "0", ApiError.UNSUPPORTED_API_RESPONSE)
    assert(response.info.data[0].ccy === TradeCurrency.BTC, ApiError.UNSUPPORTED_CURRENCY)
    assert(
      response.info.data[0].chain === SupportedChain.BTC_Bitcoin,
      ApiError.UNSUPPORTED_CURRENCY,
    )
    assert(response.info.data[0].amt > 0, ApiError.NON_POSITIVE_QUANTITY)
    assert(response.info.data[0].wdId, ApiError.MISSING_WITHDRAW_ID)
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
    let success = false
    response.forEach((withdrawals) => {
      withdrawals.forEach((withdrawal) => {
        if (
          withdrawal &&
          "currency" in withdrawal &&
          withdrawal.currency === TradeCurrency.BTC &&
          "address" in withdrawal &&
          withdrawal.address === args.address &&
          "amount" in withdrawal &&
          withdrawal.amount === amountInBtc &&
          "status" in withdrawal
        ) {
          success = true
          result.currency = withdrawal.currency
          result.address = withdrawal.address
          result.amount = withdrawal.amount
          result.status = withdrawal.status
        }
      })
    })
    assert(success, ApiError.UNSUPPORTED_API_RESPONSE)
    result.originalResponseAsIs = response
    return result
  }

  createMarketOrderValidateInput(args: CreateOrderParameters) {
    assert(args, ApiError.MISSING_PARAMETERS)
    assert(
      args.instrumentId === SupportedInstrument.OKEX_PERPETUAL_SWAP,
      ApiError.UNSUPPORTED_INSTRUMENT,
    )
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
    assert(response.id, ApiError.MISSING_ORDER_ID)
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
      btcFreeBalance: response?.BTC?.free,
      btcUsedBalance: response?.BTC?.used,
      btcTotalBalance: response?.BTC?.total,
      totalEq: Number(response.info.data[0].totalEq),
    }
  }

  fetchPositionValidateInput(instrumentId: string) {
    assert(
      instrumentId === SupportedInstrument.OKEX_PERPETUAL_SWAP,
      ApiError.UNSUPPORTED_INSTRUMENT,
    )
  }
  fetchPositionProcessApiResponse(response): FetchPositionResult {
    assert(response, ApiError.EMPTY_API_RESPONSE)
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
      last: Number(response.last),
      notionalUsd: Number(response.notionalUsd),
      margin: Number(response.margin),

      autoDeleveragingIndicator: Number(response.adl),
      liquidationPrice: Number(response.liqPx),
      positionQuantity: Number(response.pos),
      positionSide: response.posSide,
      averageOpenPrice: Number(response.avgPx),
      unrealizedPnL: Number(response.upl),
      unrealizedPnLRatio: Number(response.uplRatio),
      marginRatio: Number(response.mgnRatio),
      maintenanceMarginRequirement: Number(response.mmr),
      exchangeLeverage: Number(response.lever),
    }
  }

  fetchTickerValidateInput(instrumentId: string) {
    assert(
      instrumentId === SupportedInstrument.OKEX_PERPETUAL_SWAP ||
        instrumentId === SupportedInstrument.OKEX_BTC_USD_SPOT,
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
