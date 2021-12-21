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
  TransferParameters,
} from "./ExchangeTradingType"
import assert from "assert"
import {
  ExchangeConfiguration,
  SupportedExchange,
  SupportedInstrument,
  Headers,
} from "./ExchangeConfiguration"
import { sat2btc } from "./utils"
import { yamlConfig } from "./config"

export enum PositionMode {
  LongShort = "long_short_mode",
  Net = "net_mode",
}

export enum MarginMode {
  Isolated = "isolated",
  Cross = "cross",
}

export enum DestinationAddressType {
  OKCoin = 2,
  OKEx = 3,
  External = 4,
}

const hedgingBounds = yamlConfig.hedging

export class OkexExchangeConfiguration implements ExchangeConfiguration {
  exchangeId: SupportedExchange
  instrumentId: SupportedInstrument
  headers: Headers
  positionMode: PositionMode
  marginMode: MarginMode
  leverage: number

  constructor() {
    this.exchangeId = SupportedExchange.OKEX5
    this.instrumentId = SupportedInstrument.OKEX_PERPETUAL_SWAP
    this.headers = {}
    this.positionMode = PositionMode.Net
    this.marginMode = MarginMode.Cross
    this.leverage = hedgingBounds.HIGH_BOUND_LEVERAGE

    if (process.env["NETWORK"] === "testnet") {
      this.headers["x-simulated-trading"] = 1
    }
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
    assert(response.info, ApiError.UNSUPPORTED_API_RESPONSE)
    // OKEX specific
    assert(response.info.ccy === TradeCurrency.BTC, ApiError.UNSUPPORTED_CURRENCY)
    assert(
      response.info.chain === SupportedChain.BTC_Bitcoin,
      ApiError.UNSUPPORTED_CURRENCY,
    )
    assert(response.info.amt > 0, ApiError.NON_POSITIVE_QUANTITY)
    assert(response.info.wdId, ApiError.MISSING_WITHDRAW_ID)
  }

  transferValidateInput(args: TransferParameters) {
    assert(args, ApiError.MISSING_PARAMETERS)
    assert(args.currency === TradeCurrency.BTC, ApiError.UNSUPPORTED_CURRENCY)
    assert(args.quantity > 0, ApiError.NON_POSITIVE_QUANTITY)
    assert(args.fromAccount, ApiError.UNSUPPORTED_ADDRESS)
    assert(args.toAccount, ApiError.UNSUPPORTED_ADDRESS)
  }
  transferValidateApiResponse(response) {
    assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(response.id, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(response.currency === TradeCurrency.BTC, ApiError.UNSUPPORTED_CURRENCY)
    assert(response.amount > 0, ApiError.NON_POSITIVE_QUANTITY)
    assert(response.fromAccount, ApiError.UNSUPPORTED_ADDRESS)
    assert(response.toAccount, ApiError.UNSUPPORTED_ADDRESS)
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

    const notionalLever =
      Number(response?.info?.data?.[0]?.details?.[0]?.notionalLever) || 0
    const btcFreeBalance = Number(response?.BTC?.free) || 0
    const btcUsedBalance = Number(response?.BTC?.used) || 0
    const btcTotalBalance = Number(response?.BTC?.total) || 0
    const totalEq = Number(response.info.data[0].totalEq) || 0

    return {
      originalResponseAsIs: response,
      notionalLever: notionalLever,
      btcFreeBalance: btcFreeBalance,
      btcUsedBalance: btcUsedBalance,
      btcTotalBalance: btcTotalBalance,
      totalEq: totalEq,
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
    assert(response.info, ApiError.EMPTY_API_RESPONSE)
    assert(response.info.last, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(response.info.notionalUsd, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(response.info.margin || response.info.imr, ApiError.UNSUPPORTED_API_RESPONSE)
    const numberRegex = /-?(?=[1-9]|0(?!\d))\d+(\.\d+)?([eE][+-]?\d+)?/
    assert(typeof response.info.last === "string", ApiError.UNSUPPORTED_API_RESPONSE)
    assert.match(response.info.last, numberRegex, ApiError.UNSUPPORTED_API_RESPONSE)
    assert(
      typeof response.info.notionalUsd === "string",
      ApiError.UNSUPPORTED_API_RESPONSE,
    )
    assert.match(
      response.info.notionalUsd,
      numberRegex,
      ApiError.UNSUPPORTED_API_RESPONSE,
    )

    let margin = 0
    if (response.info.margin) {
      assert(typeof response.info.margin === "string", ApiError.UNSUPPORTED_API_RESPONSE)
      assert.match(response.info.margin, numberRegex, ApiError.UNSUPPORTED_API_RESPONSE)
      margin = Number(response.info.margin)
    } else {
      assert(typeof response.info.imr === "string", ApiError.UNSUPPORTED_API_RESPONSE)
      assert.match(response.info.imr, numberRegex, ApiError.UNSUPPORTED_API_RESPONSE)
      margin = Number(response.info.imr)
    }

    return {
      originalResponseAsIs: response,
      last: Number(response.info.last),
      notionalUsd: Number(response.info.notionalUsd),
      margin: margin,

      autoDeleveragingIndicator: Number(response.info.adl),
      liquidationPrice: Number(response.info.liqPx),
      positionQuantity: Number(response.info.pos),
      positionSide: response.info.posSide,
      averageOpenPrice: Number(response.info.avgPx),
      unrealizedPnL: Number(response.info.upl),
      unrealizedPnLRatio: Number(response.info.uplRatio),
      marginRatio: Number(response.info.mgnRatio),
      maintenanceMarginRequirement: Number(response.info.mmr),
      exchangeLeverage: Number(response.info.lever),
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
