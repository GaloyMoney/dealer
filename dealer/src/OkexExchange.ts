import assert from "assert"

import pino from "pino"

import {
  GetAccountAndPositionRiskResult,
  GetInstrumentDetailsResult,
  TradeCurrency,
  ApiError,
  GetPublicFundingRateResult,
  SetAccountConfigurationResult,
  GetPublicMarkPriceResult,
  GetMarketIndexTickersResult,
  WithdrawOnLightningResult,
  WithdrawOnLightningParameters,
  DepositOnLightningResult,
  DepositOnLightningParameters,
  GetTransactionHistoryParameters,
  GetTransactionHistoryResult,
  GetFundingRateHistoryResult,
  GetFundingRateHistoryParameters,
} from "./ExchangeTradingType"
import { ExchangeBase } from "./ExchangeBase"
import {
  ExchangeConfiguration,
  SupportedInstrument,
  SupportedInstrumentType,
} from "./ExchangeConfiguration"
import { OkexExchangeConfiguration } from "./OkexExchangeConfiguration"
import { ErrorLevel, Result } from "./Result"

import { ExchangeNames, FundingRate, Transaction } from "./database/models"
import { sleep } from "./utils"
import {
  addAttributesToCurrentSpan,
  asyncRunInSpan,
  recordExceptionInCurrentSpan,
  SemanticAttributes,
  syncRunInSpan,
} from "./services/tracing"

export enum AccountTypeToId {
  Spot = 1,
  Futures = 3,
  Margin = 5,
  Funding = 6,
  Swap = 9,
  Option = 12,
  Trading = 18, // unified trading account
  Unified = 18,
}

export class OkexExchange extends ExchangeBase {
  instrumentId: SupportedInstrument

  constructor(exchangeConfiguration: ExchangeConfiguration, logger: pino.Logger) {
    super(exchangeConfiguration, logger)
    this.instrumentId = exchangeConfiguration.instrumentId
  }

  public async getAccountAndPositionRisk(
    btcPriceInUsd,
  ): Promise<Result<GetAccountAndPositionRiskResult>> {
    const ret = await asyncRunInSpan(
      "app.okexExchange.getAccountAndPositionRisk",
      {
        [SemanticAttributes.CODE_FUNCTION]: "getAccountAndPositionRisk",
        [SemanticAttributes.CODE_NAMESPACE]: "app.okexExchange",
        [`${SemanticAttributes.CODE_FUNCTION}.params.btcPriceInUsd`]:
          JSON.stringify(btcPriceInUsd),
      },
      async () => {
        try {
          assert(btcPriceInUsd !== 0, ApiError.NON_POSITIVE_PRICE)
          assert(btcPriceInUsd, ApiError.MISSING_PARAMETERS)
          assert(btcPriceInUsd > 0, ApiError.NON_POSITIVE_PRICE)

          const result = {} as GetAccountAndPositionRiskResult

          const positionResult = await this.fetchPosition(this.instrumentId)
          this.logger.debug(
            { instrumentId: this.instrumentId, positionResult },
            "fetchPosition({instrumentId}) returned: {positionResult}",
          )
          if (!positionResult.ok) {
            if (
              positionResult.error.message === ApiError.EMPTY_API_RESPONSE ||
              positionResult.error.message === ApiError.UNSUPPORTED_API_RESPONSE
            ) {
              // No position in the derivative yet
              result.lastBtcPriceInUsd = btcPriceInUsd
              result.leverage = 0
              result.exposureInUsd = 0
            } else {
              return { ok: false, error: positionResult.error }
            }
          } else {
            const position = positionResult.value
            result.originalPosition = position
            result.lastBtcPriceInUsd = position.last
            result.leverage = position.notionalUsd / position.last / position.margin
            result.exposureInUsd = position.notionalUsd
          }

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.lastBtcPriceInUsd`]:
              result.lastBtcPriceInUsd,
            [`${SemanticAttributes.CODE_FUNCTION}.results.leverage`]: result.leverage,
            [`${SemanticAttributes.CODE_FUNCTION}.results.exposureInUsd`]:
              result.exposureInUsd,
          })

          const balanceResult = await this.fetchBalance()
          this.logger.debug({ balanceResult }, "fetchBalance() returned: {balanceResult}")
          if (!balanceResult.ok) {
            return { ok: false, error: balanceResult.error }
          }
          const balance = balanceResult.value
          result.originalBalance = balance
          result.totalAccountValueInUsd = balance.totalEq
          result.usedCollateralInUsd = balance.btcUsedBalance * result.lastBtcPriceInUsd
          result.totalCollateralInUsd = balance.btcTotalBalance * result.lastBtcPriceInUsd

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.totalAccountValueInUsd`]:
              result.totalAccountValueInUsd,
            [`${SemanticAttributes.CODE_FUNCTION}.results.usedCollateralInUsd`]:
              result.usedCollateralInUsd,
            [`${SemanticAttributes.CODE_FUNCTION}.results.totalCollateralInUsd`]:
              result.totalCollateralInUsd,
          })

          return {
            ok: true,
            value: result,
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          return { ok: false, error: error }
        }
      },
    )
    return ret as Result<GetAccountAndPositionRiskResult>
  }

  public async closePosition(instrumentId: string): Promise<Result<boolean>> {
    const ret = await asyncRunInSpan(
      "app.okexExchange.closePosition",
      {
        [SemanticAttributes.CODE_FUNCTION]: "closePosition",
        [SemanticAttributes.CODE_NAMESPACE]: "app.okexExchange",
        [`${SemanticAttributes.CODE_FUNCTION}.params.instrumentId`]: instrumentId,
        [`${SemanticAttributes.CODE_FUNCTION}.sub.method`]:
          "privatePostTradeClosePosition",
      },
      async () => {
        try {
          const config = this.exchangeConfig as OkexExchangeConfiguration
          const params = {
            instId: instrumentId,
            mgnMode: config.marginMode,
            autoCxl: true,
          }

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.sub.params`]: JSON.stringify(params),
          })

          const response = await this.exchange.privatePostTradeClosePosition(params)
          this.logger.debug(
            { config, params, response },
            "exchange.privatePostTradeClosePosition({params}) returned: {response}",
          )

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.result`]:
              JSON.stringify(response),
          })

          return {
            ok: true,
            value: true,
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Info })
          return { ok: true, value: true }
        }
      },
    )
    return ret as Result<boolean>
  }

  public async getInstrumentDetails(): Promise<Result<GetInstrumentDetailsResult>> {
    const ret = await asyncRunInSpan(
      "app.okexExchange.getInstrumentDetails",
      {
        [SemanticAttributes.CODE_FUNCTION]: "getInstrumentDetails",
        [SemanticAttributes.CODE_NAMESPACE]: "app.okexExchange",
        [`${SemanticAttributes.CODE_FUNCTION}.sub.method`]: "publicGetPublicInstruments",
        [`${SemanticAttributes.CODE_FUNCTION}.sub.params.instType`]:
          SupportedInstrumentType.Swap,
        [`${SemanticAttributes.CODE_FUNCTION}.sub.params.instId`]: this.instrumentId,
      },
      async () => {
        try {
          const response = await this.exchange.publicGetPublicInstruments({
            instType: SupportedInstrumentType.Swap,
            instId: this.instrumentId,
          })
          this.logger.debug(
            { instrumentId: this.instrumentId, response },
            "publicGetPublicInstruments({instrumentId}) returned: {response}",
          )

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.sub.results.result`]:
              JSON.stringify(response),
          })

          assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
          assert(
            response.data[0].ctValCcy === TradeCurrency.USD,
            ApiError.UNSUPPORTED_CURRENCY,
          )
          assert(response.data[0].minSz > 0, ApiError.NON_POSITIVE_QUANTITY)
          assert(response.data[0].ctVal > 0, ApiError.NON_POSITIVE_PRICE)

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.minSz`]: response.data[0].minSz,
            [`${SemanticAttributes.CODE_FUNCTION}.results.ctVal`]: response.data[0].ctVal,
          })

          return {
            ok: true,
            value: {
              originalResponseAsIs: response,
              minimumOrderSizeInContract: Number(response.data[0].minSz),
              contractFaceValue: Number(response.data[0].ctVal),
            },
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          return { ok: false, error: error }
        }
      },
    )
    return ret as Result<GetInstrumentDetailsResult>
  }

  public async getPublicFundingRate(): Promise<Result<GetPublicFundingRateResult>> {
    const ret = await asyncRunInSpan(
      "app.okexExchange.getPublicFundingRate",
      {
        [SemanticAttributes.CODE_FUNCTION]: "getPublicFundingRate",
        [SemanticAttributes.CODE_NAMESPACE]: "app.okexExchange",
        [`${SemanticAttributes.CODE_FUNCTION}.sub.method`]: "publicGetPublicFundingRate",
        [`${SemanticAttributes.CODE_FUNCTION}.sub.params.instId`]: this.instrumentId,
      },
      async () => {
        try {
          const response = await this.exchange.publicGetPublicFundingRate({
            instId: this.instrumentId,
          })
          this.logger.debug(
            { instrumentId: this.instrumentId, response },
            "exchange.publicGetPublicFundingRate({instrumentId}) returned: {response}",
          )

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.sub.results.result`]:
              JSON.stringify(response),
          })

          assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
          assert(
            response.data[0].instId === this.instrumentId,
            ApiError.UNSUPPORTED_INSTRUMENT,
          )
          assert(response.data[0].fundingRate, ApiError.UNSUPPORTED_API_RESPONSE)
          assert(response.data[0].nextFundingRate, ApiError.UNSUPPORTED_API_RESPONSE)

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.fundingRate`]:
              response.data[0].fundingRate,
            [`${SemanticAttributes.CODE_FUNCTION}.results.nextFundingRate`]:
              response.data[0].nextFundingRate,
          })

          return {
            ok: true,
            value: {
              originalResponseAsIs: response,
              fundingRate: response.data[0].fundingRate,
              nextFundingRate: response.data[0].nextFundingRate,
            },
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          return { ok: false, error: error }
        }
      },
    )
    return ret as Result<GetPublicFundingRateResult>
  }

  public async getPublicMarkPrice(): Promise<Result<GetPublicMarkPriceResult>> {
    const ret = await asyncRunInSpan(
      "app.okexExchange.getPublicMarkPrice",
      {
        [SemanticAttributes.CODE_FUNCTION]: "getPublicMarkPrice",
        [SemanticAttributes.CODE_NAMESPACE]: "app.okexExchange",
        [`${SemanticAttributes.CODE_FUNCTION}.sub.method`]: "publicGetPublicMarkPrice",
        [`${SemanticAttributes.CODE_FUNCTION}.sub.params.instType`]:
          SupportedInstrumentType.Swap,
        [`${SemanticAttributes.CODE_FUNCTION}.sub.params.instId`]: this.instrumentId,
      },
      async () => {
        try {
          const response = await this.exchange.publicGetPublicMarkPrice({
            instType: SupportedInstrumentType.Swap,
            instId: this.instrumentId,
          })
          this.logger.debug(
            { instrumentId: this.instrumentId, response },
            "exchange.publicGetPublicMarkPrice({instrumentId}) returned: {response}",
          )

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.sub.results.result`]:
              JSON.stringify(response),
          })

          assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
          assert(
            response?.data[0]?.instType === SupportedInstrumentType.Swap,
            ApiError.UNSUPPORTED_INSTRUMENT,
          )
          assert(
            response?.data[0]?.instId === this.instrumentId,
            ApiError.UNSUPPORTED_INSTRUMENT,
          )
          assert(response?.data[0]?.markPx, ApiError.UNSUPPORTED_API_RESPONSE)

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.markPriceInUsd`]:
              response.data[0].markPx,
          })

          return {
            ok: true,
            value: {
              originalResponseAsIs: response,
              markPriceInUsd: Number(response.data[0].markPx),
            },
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          return { ok: false, error: error }
        }
      },
    )
    return ret as Result<GetPublicMarkPriceResult>
  }

  public async getMarketIndexTickers(): Promise<Result<GetMarketIndexTickersResult>> {
    const ret = await asyncRunInSpan(
      "app.okexExchange.getMarketIndexTickers",
      {
        [SemanticAttributes.CODE_FUNCTION]: "getMarketIndexTickers",
        [SemanticAttributes.CODE_NAMESPACE]: "app.okexExchange",
        [`${SemanticAttributes.CODE_FUNCTION}.sub.method`]: "publicGetMarketIndexTickers",
        [`${SemanticAttributes.CODE_FUNCTION}.sub.params.instId`]:
          SupportedInstrument.OKEX_BTC_USD_SPOT,
      },
      async () => {
        try {
          const response = await this.exchange.publicGetMarketIndexTickers({
            instId: SupportedInstrument.OKEX_BTC_USD_SPOT,
          })
          this.logger.debug(
            { instrumentId: this.instrumentId, response },
            "exchange.publicGetMarketIndexTickers({instrumentId}) returned: {response}",
          )

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.sub.results.result`]:
              JSON.stringify(response),
          })

          assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
          assert(
            response?.data[0]?.instId === SupportedInstrument.OKEX_BTC_USD_SPOT,
            ApiError.UNSUPPORTED_INSTRUMENT,
          )
          assert(response?.data[0]?.idxPx, ApiError.UNSUPPORTED_API_RESPONSE)

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.indexPriceInUsd`]:
              response.data[0].idxPx,
          })

          return {
            ok: true,
            value: {
              originalResponseAsIs: response,
              indexPriceInUsd: Number(response.data[0].idxPx),
            },
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          return { ok: false, error: error }
        }
      },
    )
    return ret as Result<GetMarketIndexTickersResult>
  }

  public async setAccountConfiguration(): Promise<Result<SetAccountConfigurationResult>> {
    const ret = await asyncRunInSpan(
      "app.okexExchange.setAccountConfiguration",
      {
        [SemanticAttributes.CODE_FUNCTION]: "setAccountConfiguration",
        [SemanticAttributes.CODE_NAMESPACE]: "app.okexExchange",
      },
      async () => {
        try {
          const config = this.exchangeConfig as OkexExchangeConfiguration

          try {
            const currencies = await this.exchange.privateGetAssetCurrencies()
            const btcCurrency = currencies?.data?.find(
              (currency) => currency?.chain === "BTC-Bitcoin",
            )
            if (btcCurrency) {
              this.logger.debug(
                { config, response: btcCurrency },
                "exchange.privateGetAssetCurrencies() returned: {response}",
              )
              if (btcCurrency?.minWd)
                config.minOnChainWithdrawalAmount = Number(btcCurrency?.minWd)
              if (btcCurrency?.minFee)
                config.minOnChainWithdrawalFee = Number(btcCurrency?.minFee)
              if (btcCurrency?.maxFee)
                config.maxOnChainWithdrawalFee = Number(btcCurrency?.maxFee)
              this.logger.debug(
                { config, response: btcCurrency },
                "ExchangeConfiguration after update: {config}",
              )
            }
          } catch (error) {
            recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
            this.logger.error(
              { error },
              "exchange.privateGetAssetCurrencies() failed: {error}",
            )
          }

          const args1 = { posMode: config.positionMode }
          const positionResponse = await this.exchange.privatePostAccountSetPositionMode(
            args1,
          )
          this.logger.debug(
            { args: args1, response: positionResponse },
            "exchange.privatePostAccountSetPositionMode({args}) returned: {response}",
          )
          assert(positionResponse, ApiError.UNSUPPORTED_API_RESPONSE)
          assert(
            positionResponse.data[0].posMode === args1.posMode,
            ApiError.INVALID_POSITION_MODE,
          )

          const args2 = {
            instId: this.instrumentId,
            lever: config.leverage,
            mgnMode: config.marginMode,
          }
          const leverageResponse = await this.exchange.privatePostAccountSetLeverage(
            args2,
          )
          this.logger.debug(
            { args: args2, response: leverageResponse },
            "exchange.privatePostAccountSetLeverage({args}) returned: {response}",
          )
          assert(leverageResponse, ApiError.UNSUPPORTED_API_RESPONSE)
          assert(
            leverageResponse.data[0].instId === args2.instId.toString(),
            ApiError.INVALID_LEVERAGE_CONFIG,
          )
          assert(
            leverageResponse.data[0].lever === args2.lever.toString(),
            ApiError.INVALID_LEVERAGE_CONFIG,
          )
          assert(
            leverageResponse.data[0].mgnMode === args2.mgnMode.toString(),
            ApiError.INVALID_LEVERAGE_CONFIG,
          )

          return {
            ok: true,
            value: {
              originalResponseAsIs: { positionResponse, leverageResponse },
            },
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          this.logger.error(
            { error },
            "exchange.setAccountConfiguration() failed: {error}",
          )
          return { ok: false, error: error }
        }
      },
    )
    return ret as Result<SetAccountConfigurationResult>
  }

  public async withdrawOnLightning(
    args: WithdrawOnLightningParameters,
  ): Promise<Result<WithdrawOnLightningResult>> {
    const ret = await asyncRunInSpan(
      "app.okexExchange.withdrawOnLightning",
      {
        [SemanticAttributes.CODE_FUNCTION]: "withdrawOnLightning",
        [SemanticAttributes.CODE_NAMESPACE]: "app.okexExchange",
        [`${SemanticAttributes.CODE_FUNCTION}.params.args`]: JSON.stringify(args),
        [`${SemanticAttributes.CODE_FUNCTION}.sub.method`]:
          "privatePostAssetWithdrawalLightning",
      },
      async () => {
        try {
          const params = {
            ccy: args.currency,
            invoice: args.invoice,
            pwd: this.fundingPassword,
          }

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.sub.params`]: JSON.stringify(params),
          })

          const response = await this.exchange.privatePostAssetWithdrawalLightning(params)
          this.logger.debug(
            { params, response },
            "privatePostAssetWithdrawalLightning({params}) returned: {response}",
          )

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.sub.results.result`]:
              JSON.stringify(response),
          })

          assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
          assert(response.code === "0", ApiError.UNSUPPORTED_API_RESPONSE)
          assert(response.data[0].wdId, ApiError.UNSUPPORTED_API_RESPONSE)

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.withdrawId`]:
              response.data[0].wdId,
          })

          return {
            ok: true,
            value: {
              originalResponseAsIs: response,
              id: response.data[0].wdId,
            },
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          return { ok: false, error: error }
        }
      },
    )
    return ret as Result<WithdrawOnLightningResult>
  }

  public async depositOnLightning(
    args: DepositOnLightningParameters,
  ): Promise<Result<DepositOnLightningResult>> {
    const ret = await asyncRunInSpan(
      "app.okexExchange.depositOnLightning",
      {
        [SemanticAttributes.CODE_FUNCTION]: "depositOnLightning",
        [SemanticAttributes.CODE_NAMESPACE]: "app.okexExchange",
        [`${SemanticAttributes.CODE_FUNCTION}.params.args`]: JSON.stringify(args),
        [`${SemanticAttributes.CODE_FUNCTION}.sub.method`]:
          "privateGetAssetDepositLightning",
      },
      async () => {
        try {
          const params = {
            ccy: args.currency,
            amt: args.amountInSats,
            to: AccountTypeToId.Trading,
          }

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.sub.params`]: JSON.stringify(params),
          })

          const response = await this.exchange.privateGetAssetDepositLightning(params)
          this.logger.debug(
            { params, response },
            "privateGetAssetDepositLightning({params}) returned: {response}",
          )

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.sub.results.result`]:
              JSON.stringify(response),
          })

          assert(response, ApiError.UNSUPPORTED_API_RESPONSE)
          assert(response.data[0].invoice, ApiError.UNSUPPORTED_API_RESPONSE)

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.invoice`]:
              response.data[0].invoice,
          })

          return {
            ok: true,
            value: {
              originalResponseAsIs: response,
              invoice: response.data[0].invoice,
            },
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          return { ok: false, error: error }
        }
      },
    )
    return ret as Result<DepositOnLightningResult>
  }

  private extractValidTransactionFromApiResponse(apiResponse): Transaction[] {
    const ret = syncRunInSpan(
      "app.okexExchange.extractValidTransactionFromApiResponse",
      {
        [SemanticAttributes.CODE_FUNCTION]: "extractValidTransactionFromApiResponse",
        [SemanticAttributes.CODE_NAMESPACE]: "app.okexExchange",
      },
      () => {
        const transactions: Transaction[] = []

        try {
          if (apiResponse?.data) {
            for (const rawTransaction of apiResponse.data) {
              const transaction: Transaction = {
                balance: Number(rawTransaction.bal),
                balanceChange: Number(rawTransaction.balChg),
                billId: rawTransaction.billId,
                currency: rawTransaction.ccy,
                executionType: rawTransaction.execType,
                fee: Number(rawTransaction.fee),
                fromAccountId: Number(rawTransaction.from),
                instrumentId: rawTransaction.instId,
                instrumentType: rawTransaction.instType,
                marginMode: rawTransaction.mgnMode,
                notes: rawTransaction.notes,
                orderId: rawTransaction.ordId,
                pnl: Number(rawTransaction.pnl),
                positionBalance: Number(rawTransaction.posBal),
                positionBalanceChange: Number(rawTransaction.posBalChg),
                billSubtypeId: Number(rawTransaction.subType),
                quantity: Number(rawTransaction.sz),
                toAccountId: Number(rawTransaction.to),
                timestamp: rawTransaction.ts,
                billTypeId: Number(rawTransaction.type),
              }
              transactions.push(transaction)
            }
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          this.logger.error(
            { apiResponse, error },
            "extractValidTransactionFromApiResponse({apiResponse}) failed: {error}",
          )
        }

        return transactions
      },
    )
    return ret
  }

  public async fetchTransactionHistory(
    args: GetTransactionHistoryParameters,
  ): Promise<Result<GetTransactionHistoryResult>> {
    const ret = await asyncRunInSpan(
      "app.okexExchange.fetchTransactionHistory",
      {
        [SemanticAttributes.CODE_FUNCTION]: "fetchTransactionHistory",
        [SemanticAttributes.CODE_NAMESPACE]: "app.okexExchange",
        [`${SemanticAttributes.CODE_FUNCTION}.params.args`]: JSON.stringify(args),
      },
      async () => {
        try {
          let transactions: Transaction[]
          if (args.afterTransactionId) {
            transactions = await this.fetchTransactionHistoryAllPagesAfter(args)
          } else if (args.beforeTransactionId) {
            transactions = await this.fetchTransactionHistoryAllPagesBefore(args)
          } else {
            transactions = await this.fetchTransactionHistoryAllPagesAfter(args)
          }
          this.logger.debug(
            { args, response: transactions },
            "privateGetAccountBillsArchive({args}) returned: {response}",
          )

          return {
            ok: true,
            value: {
              originalResponseAsIs: transactions,
              transactions: transactions,
            },
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          return { ok: false, error: error }
        }
      },
    )
    return ret as Result<GetTransactionHistoryResult>
  }

  private async fetchTransactionHistoryAllPagesBefore(
    args: GetTransactionHistoryParameters,
  ): Promise<Transaction[]> {
    const ret = await asyncRunInSpan(
      "app.okexExchange.fetchTransactionHistoryAllPagesBefore",
      {
        [SemanticAttributes.CODE_FUNCTION]: "fetchTransactionHistoryAllPagesBefore",
        [SemanticAttributes.CODE_NAMESPACE]: "app.okexExchange",
        [`${SemanticAttributes.CODE_FUNCTION}.params.args`]: JSON.stringify(args),
      },
      async () => {
        let allTransactions: Transaction[] = []
        try {
          let before = args.beforeTransactionId
          const limit = args.limit || 100
          const one = true
          while (one) {
            const params = {
              after: args.afterTransactionId,
              before: before,
              limit: limit,
            }
            const response = await this.exchange.privateGetAccountBillsArchive(params)
            await sleep(this.exchange.rateLimit)
            this.logger.debug(
              { params, response },
              "exchange.privateGetAccountBillsArchive({params}) returned: {response}",
            )
            if (response?.data?.length) {
              before = response.data[0].billId
              const transactions = this.extractValidTransactionFromApiResponse(response)
              allTransactions = transactions.concat(allTransactions)
              if (!before) {
                break
              }
            } else {
              break
            }
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          this.logger.warn({ error }, "Error in fetchTransactionHistoryAllPagesBefore()")
        }
        return allTransactions
      },
    )

    return ret
  }

  private async fetchTransactionHistoryAllPagesAfter(
    args: GetTransactionHistoryParameters,
  ): Promise<Transaction[]> {
    const ret = await asyncRunInSpan(
      "app.okexExchange.fetchTransactionHistoryAllPagesAfter",
      {
        [SemanticAttributes.CODE_FUNCTION]: "fetchTransactionHistoryAllPagesAfter",
        [SemanticAttributes.CODE_NAMESPACE]: "app.okexExchange",
        [`${SemanticAttributes.CODE_FUNCTION}.params.args`]: JSON.stringify(args),
      },
      async () => {
        let allTransactions: Transaction[] = []
        try {
          let after = args.afterTransactionId
          const limit = args.limit || 100
          const one = true
          while (one) {
            const params = {
              after: after,
              before: args.beforeTransactionId,
              limit: limit,
            }
            const response = await this.exchange.privateGetAccountBillsArchive(params)
            await sleep(this.exchange.rateLimit)
            this.logger.debug(
              { params, response },
              "exchange.privateGetAccountBillsArchive({params}) returned: {response}",
            )
            if (response?.data?.length) {
              after = response.data[response.data.length - 1].billId
              const transactions = this.extractValidTransactionFromApiResponse(response)
              allTransactions = allTransactions.concat(transactions)
              if (!after) {
                break
              }
            } else {
              break
            }
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          this.logger.error({ error }, "Error in fetchTransactionHistoryAllPagesAfter()")
        }
        return allTransactions
      },
    )
    return ret
  }

  private extractValidFundingRateFromApiResponse(apiResponse): FundingRate[] {
    const ret = syncRunInSpan(
      "app.okexExchange.extractValidFundingRateFromApiResponse",
      {
        [SemanticAttributes.CODE_FUNCTION]: "extractValidFundingRateFromApiResponse",
        [SemanticAttributes.CODE_NAMESPACE]: "app.okexExchange",
      },
      () => {
        const fundingRates: FundingRate[] = []

        try {
          if (apiResponse?.data) {
            for (const rawFundingRate of apiResponse.data) {
              const fundingRate: FundingRate = {
                fundingRate: Number(rawFundingRate.fundingRate),
                instrumentId: rawFundingRate.instId,
                exchangeName: ExchangeNames.Okex,

                timestamp: new Date(Number(rawFundingRate.fundingTime)).toUTCString(),
                fundingTime: Number(rawFundingRate.fundingTime),
              }
              fundingRates.push(fundingRate)
            }
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          this.logger.error(
            { apiResponse, error },
            "extractValidFundingRateFromApiResponse({apiResponse}) failed: {error}",
          )
        }

        return fundingRates
      },
    )
    return ret
  }

  public async fetchFundingRateHistory(
    args: GetFundingRateHistoryParameters,
  ): Promise<Result<GetFundingRateHistoryResult>> {
    const ret = await asyncRunInSpan(
      "app.okexExchange.fetchFundingRateHistory",
      {
        [SemanticAttributes.CODE_FUNCTION]: "fetchFundingRateHistory",
        [SemanticAttributes.CODE_NAMESPACE]: "app.okexExchange",
        [`${SemanticAttributes.CODE_FUNCTION}.params.args`]: JSON.stringify(args),
      },
      async () => {
        try {
          let fundingRates: FundingRate[]
          if (args.afterFundingTime) {
            fundingRates = await this.fetchFundingRateHistoryAllPagesAfter(args)
          } else if (args.beforeFundingTime) {
            fundingRates = await this.fetchFundingRateHistoryAllPagesBefore(args)
          } else {
            fundingRates = await this.fetchFundingRateHistoryAllPagesAfter(args)
          }
          this.logger.debug(
            { args, response: fundingRates },
            "publicGetPublicFundingRateHistory({args}) returned: {response}",
          )

          return {
            ok: true,
            value: {
              originalResponseAsIs: fundingRates,
              fundingRates: fundingRates,
            },
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          return { ok: false, error: error }
        }
      },
    )
    return ret as Result<GetFundingRateHistoryResult>
  }

  private async fetchFundingRateHistoryAllPagesBefore(
    args: GetFundingRateHistoryParameters,
  ): Promise<FundingRate[]> {
    const ret = await asyncRunInSpan(
      "app.okexExchange.fetchFundingRateHistoryAllPagesBefore",
      {
        [SemanticAttributes.CODE_FUNCTION]: "fetchFundingRateHistoryAllPagesBefore",
        [SemanticAttributes.CODE_NAMESPACE]: "app.okexExchange",
        [`${SemanticAttributes.CODE_FUNCTION}.params.args`]: JSON.stringify(args),
      },
      async () => {
        let allFundingRates: FundingRate[] = []
        try {
          let before = args.beforeFundingTime
          const limit = args.limit || 100
          const one = true
          while (one) {
            const params = {
              instId: args.instrumentId,
              after: args.afterFundingTime,
              before: before,
              limit: limit,
            }
            const response = await this.exchange.publicGetPublicFundingRateHistory(params)
            await sleep(this.exchange.rateLimit)
            this.logger.debug(
              { params, response },
              "exchange.publicGetPublicFundingRateHistory({params}) returned: {response}",
            )
            if (response?.data?.length) {
              before = response.data[0].billId
              const fundingRates = this.extractValidFundingRateFromApiResponse(response)
              allFundingRates = fundingRates.concat(allFundingRates)
              if (!before) {
                break
              }
            } else {
              break
            }
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          this.logger.error({ error }, "Error in fetchFundingRateHistoryAllPagesBefore()")
        }
        return allFundingRates
      },
    )

    return ret
  }

  private async fetchFundingRateHistoryAllPagesAfter(
    args: GetFundingRateHistoryParameters,
  ): Promise<FundingRate[]> {
    const ret = await asyncRunInSpan(
      "app.okexExchange.fetchFundingRateHistoryAllPagesAfter",
      {
        [SemanticAttributes.CODE_FUNCTION]: "fetchFundingRateHistoryAllPagesAfter",
        [SemanticAttributes.CODE_NAMESPACE]: "app.okexExchange",
        [`${SemanticAttributes.CODE_FUNCTION}.params.args`]: JSON.stringify(args),
      },
      async () => {
        let allFundingRates: FundingRate[] = []
        try {
          let after = args.afterFundingTime
          const limit = args.limit || 100
          const one = true
          while (one) {
            const params = {
              instId: args.instrumentId,
              after: after,
              before: args.beforeFundingTime,
              limit: limit,
            }
            const response = await this.exchange.publicGetPublicFundingRateHistory(params)
            await sleep(this.exchange.rateLimit)
            this.logger.debug(
              { params, response },
              "exchange.publicGetPublicFundingRateHistory({params}) returned: {response}",
            )
            if (response?.data?.length) {
              after = response.data[response.data.length - 1].billId
              const fundingRates = this.extractValidFundingRateFromApiResponse(response)
              allFundingRates = allFundingRates.concat(fundingRates)
              if (!after) {
                break
              }
            } else {
              break
            }
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          this.logger.error({ error }, "Error in fetchFundingRateHistoryAllPagesAfter()")
        }
        return allFundingRates
      },
    )
    return ret
  }
}
