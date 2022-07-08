import ccxt, { ExchangeId } from "ccxt"

import pino from "pino"

import {
  FetchDepositAddressResult,
  WithdrawParameters,
  WithdrawResult,
  CreateOrderParameters,
  CreateOrderResult,
  FetchOrderResult,
  GetAccountAndPositionRiskResult,
  GetInstrumentDetailsResult,
  PrivateGetAccountResult,
  FetchPositionResult,
  FetchTickerResult,
  FetchBalanceResult,
  FetchDepositsResult,
  FetchWithdrawalsResult,
  FetchWithdrawalsParameters,
  FetchDepositsParameters,
  OrderStatus,
  GetPublicFundingRateResult,
  SetAccountConfigurationResult,
  GetPublicMarkPriceResult,
  GetMarketIndexTickersResult,
  TransferParameters,
  TransferResult,
  WithdrawOnLightningResult,
  WithdrawOnLightningParameters,
  DepositOnLightningResult,
  DepositOnLightningParameters,
  GetTransactionHistoryParameters,
  GetTransactionHistoryResult,
  FetchFundingAccountBalanceResult,
  GetFundingRateHistoryParameters,
  GetFundingRateHistoryResult,
} from "./ExchangeTradingType"
import { ErrorLevel, Result } from "./Result"
import { ExchangeConfiguration, Headers } from "./ExchangeConfiguration"

import {
  addAttributesToCurrentSpan,
  asyncRunInSpan,
  recordExceptionInCurrentSpan,
  SemanticAttributes,
} from "./services/tracing"

export abstract class ExchangeBase {
  exchangeConfig: ExchangeConfiguration
  exchangeId: ExchangeId
  headers: Headers
  fundingPassword: string
  exchange: ccxt.okex5
  logger: pino.Logger

  constructor(exchangeConfig: ExchangeConfiguration, logger: pino.Logger) {
    this.exchangeConfig = exchangeConfig
    this.exchangeId = exchangeConfig.exchangeId as ExchangeId
    this.headers = exchangeConfig.headers

    const apiKey = process.env[`${this.exchangeId.toUpperCase()}_KEY`]
    const secret = process.env[`${this.exchangeId.toUpperCase()}_SECRET`]
    const password = process.env[`${this.exchangeId.toUpperCase()}_PASSWORD`]
    const fundingPassword = process.env[`${this.exchangeId.toUpperCase()}_FUND_PASSWORD`]

    if (!apiKey || !secret || !password || !fundingPassword) {
      throw new Error(`Missing ${this.exchangeId} exchange environment variables`)
    }

    this.fundingPassword = fundingPassword

    const exchangeClass = ccxt[this.exchangeId]
    this.exchange = new exchangeClass({ apiKey, secret, password, headers: this.headers })

    this.exchange.options["createMarketBuyOrderRequiresPrice"] = false

    // The following check throws if something is wrong
    this.exchange.checkRequiredCredentials()

    this.logger = logger.child({ class: `${ExchangeBase.name}-${this.exchangeId}` })
  }

  public async fetchDepositAddress(
    currency: string,
  ): Promise<Result<FetchDepositAddressResult>> {
    const ret = await asyncRunInSpan(
      "app.exchangeBase.fetchDepositAddress",
      {
        [SemanticAttributes.CODE_FUNCTION]: "fetchDepositAddress",
        [SemanticAttributes.CODE_NAMESPACE]: "app.exchangeBase",
        [`${SemanticAttributes.CODE_FUNCTION}.params.currency`]: currency,
      },
      async () => {
        try {
          this.exchangeConfig.fetchDepositAddressValidateInput(currency)

          const response = await this.exchange.fetchDepositAddress(currency)
          this.logger.debug(
            { currency, response },
            "exchange.fetchDepositAddress({currency}) returned: {response}",
          )

          const result =
            this.exchangeConfig.fetchDepositAddressProcessApiResponse(response)

          const { originalResponseAsIs, ...logTheRest } = result
          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.result`]:
              JSON.stringify(logTheRest),
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
    return ret as Result<FetchDepositAddressResult>
  }

  public async fetchDeposits(
    args: FetchDepositsParameters,
  ): Promise<Result<FetchDepositsResult>> {
    const ret = await asyncRunInSpan(
      "app.exchangeBase.fetchDeposits",
      {
        [SemanticAttributes.CODE_FUNCTION]: "fetchDeposits",
        [SemanticAttributes.CODE_NAMESPACE]: "app.exchangeBase",
        [`${SemanticAttributes.CODE_FUNCTION}.params.args`]: JSON.stringify(args),
      },
      async () => {
        try {
          this.exchangeConfig.fetchDepositsValidateInput(args)

          // No way to filter on request, so get them all...
          const response = await this.fetchDepositsAllPages(args)
          this.logger.debug(
            { args, response },
            "exchange.fetchDeposits({args}) returned: {response}",
          )

          // ...then filter
          const result = this.exchangeConfig.fetchDepositsProcessApiResponse(
            args,
            response,
          )

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
    return ret as Result<FetchDepositsResult>
  }

  private async fetchDepositsAllPages(args: FetchDepositsParameters) {
    return asyncRunInSpan(
      "app.exchangeBase.fetchDepositsAllPages",
      {
        [SemanticAttributes.CODE_FUNCTION]: "fetchDepositsAllPages",
        [SemanticAttributes.CODE_NAMESPACE]: "app.exchangeBase",
        [`${SemanticAttributes.CODE_FUNCTION}.params.args`]: JSON.stringify(args),
      },
      async () => {
        const allDeposits: unknown[] = []
        try {
          let page = 0
          const one = true
          while (one) {
            const code = undefined
            const since = undefined
            const limit = 100
            const params = {
              address: args.address,
              amountInSats: args.amountInSats,
              page: page,
            }
            const deposits = await this.exchange.fetchDeposits(code, since, limit, params)
            this.logger.debug(
              { code, since, limit, params, deposits },
              "exchange.fetchDeposits({code}, {since}, {limit}, {params}) returned: {deposits}",
            )
            if (deposits.length) {
              page = this.exchange.last_json_response["cursor"]
              allDeposits.push(deposits)
              if (!page) {
                break
              }
            } else {
              break
            }
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          this.logger.debug({ error }, "Error in fetchDepositsAllPages()" + error.message)
        }
        return allDeposits
      },
    )
  }

  public async withdraw(args: WithdrawParameters): Promise<Result<WithdrawResult>> {
    const ret = await asyncRunInSpan(
      "app.exchangeBase.withdraw",
      {
        [SemanticAttributes.CODE_FUNCTION]: "withdraw",
        [SemanticAttributes.CODE_NAMESPACE]: "app.exchangeBase",
        [`${SemanticAttributes.CODE_FUNCTION}.params.args`]: JSON.stringify(args),
      },
      async () => {
        try {
          this.exchangeConfig.withdrawValidateInput(args)

          const noTag = undefined
          const response = await this.exchange.withdraw(
            args.currency,
            args.quantity,
            args.address,
            noTag,
            args.params,
          )
          this.logger.debug(
            { args, response },
            "exchange.withdraw({args}) returned: {response}",
          )

          this.exchangeConfig.withdrawValidateApiResponse(response)

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.result`]:
              JSON.stringify(response),
          })

          return {
            ok: true,
            value: {
              originalResponseAsIs: response,
              id: response.id,
            },
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          return { ok: false, error: error }
        }
      },
    )
    return ret as Result<WithdrawResult>
  }

  public async transfer(args: TransferParameters): Promise<Result<TransferResult>> {
    const ret = await asyncRunInSpan(
      "app.exchangeBase.transfer",
      {
        [SemanticAttributes.CODE_FUNCTION]: "transfer",
        [SemanticAttributes.CODE_NAMESPACE]: "app.exchangeBase",
        [`${SemanticAttributes.CODE_FUNCTION}.params.args`]: JSON.stringify(args),
      },
      async () => {
        try {
          this.exchangeConfig.transferValidateInput(args)

          const response = await this.exchange.transfer(
            args.currency,
            args.quantity,
            args.fromAccount,
            args.toAccount,
            args.params,
          )
          this.logger.debug(
            { args, response },
            "exchange.transfer({args}) returned: {response}",
          )

          this.exchangeConfig.transferValidateApiResponse(response)

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.result`]:
              JSON.stringify(response),
          })

          return {
            ok: true,
            value: {
              originalResponseAsIs: response,
              id: response.id,
            },
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          return { ok: false, error: error }
        }
      },
    )
    return ret as Result<TransferResult>
  }

  public async fetchWithdrawals(
    args: FetchWithdrawalsParameters,
  ): Promise<Result<FetchWithdrawalsResult>> {
    const ret = await asyncRunInSpan(
      "app.exchangeBase.fetchWithdrawals",
      {
        [SemanticAttributes.CODE_FUNCTION]: "fetchWithdrawals",
        [SemanticAttributes.CODE_NAMESPACE]: "app.exchangeBase",
        [`${SemanticAttributes.CODE_FUNCTION}.params.args`]: JSON.stringify(args),
      },
      async () => {
        try {
          this.exchangeConfig.fetchWithdrawalsValidateInput(args)

          // No way to filter on request, so get them all...
          const response = await this.fetchWithdrawalsAllPages(args)
          this.logger.debug(
            { args, response },
            "exchange.fetchWithdrawals({args}) returned: {response}",
          )

          // ...then filter
          const result = this.exchangeConfig.fetchWithdrawalsProcessApiResponse(
            args,
            response,
          )

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
    return ret as Result<FetchWithdrawalsResult>
  }

  private async fetchWithdrawalsAllPages(args: FetchWithdrawalsParameters) {
    return asyncRunInSpan(
      "app.exchangeBase.fetchWithdrawalsAllPages",
      {
        [SemanticAttributes.CODE_FUNCTION]: "fetchWithdrawalsAllPages",
        [SemanticAttributes.CODE_NAMESPACE]: "app.exchangeBase",
        [`${SemanticAttributes.CODE_FUNCTION}.params.args`]: JSON.stringify(args),
      },
      async () => {
        const allWithdrawals: unknown[] = []
        try {
          let page = 0
          const one = true
          while (one) {
            const code = undefined
            const since = undefined
            const limit = 100
            const params = {
              address: args.address,
              amountInSats: args.amountInSats,
              page: page,
            }
            const withdrawals = await this.exchange.fetchWithdrawals(
              code,
              since,
              limit,
              params,
            )
            this.logger.debug(
              { code, since, limit, params, withdrawals },
              "exchange.fetchWithdrawals({code}, {since}, {limit}, {params}) returned: {withdrawals}",
            )
            if (withdrawals.length) {
              page = this.exchange.last_json_response["cursor"]
              allWithdrawals.push(withdrawals)
              if (!page) {
                break
              }
            } else {
              break
            }
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          this.logger.debug(
            { error },
            "Error in fetchWithdrawalsAllPages()" + error.message,
          )
        }
        return allWithdrawals
      },
    )
  }

  public async createMarketOrder(
    args: CreateOrderParameters,
  ): Promise<Result<CreateOrderResult>> {
    const ret = await asyncRunInSpan(
      "app.exchangeBase.createMarketOrder",
      {
        [SemanticAttributes.CODE_FUNCTION]: "createMarketOrder",
        [SemanticAttributes.CODE_NAMESPACE]: "app.exchangeBase",
        [`${SemanticAttributes.CODE_FUNCTION}.params.args`]: JSON.stringify(args),
      },
      async () => {
        try {
          this.exchangeConfig.createMarketOrderValidateInput(args)

          const limitPrice = undefined

          const response = await this.exchange.createMarketOrder(
            args.instrumentId,
            args.side as ccxt.Order["side"],
            args.quantity,
            limitPrice,
            args.params,
          )
          this.logger.debug(
            { args, response },
            "exchange.createMarketOrder({args}) returned: {response}",
          )

          this.exchangeConfig.createMarketOrderValidateApiResponse(response)

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.result`]:
              JSON.stringify(response),
          })

          return {
            ok: true,
            value: {
              originalResponseAsIs: response,
              id: response.id,
            },
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          return { ok: false, error: error }
        }
      },
    )
    return ret as Result<CreateOrderResult>
  }

  public async fetchOrder(id: string): Promise<Result<FetchOrderResult>> {
    const ret = await asyncRunInSpan(
      "app.exchangeBase.fetchOrder",
      {
        [SemanticAttributes.CODE_FUNCTION]: "fetchOrder",
        [SemanticAttributes.CODE_NAMESPACE]: "app.exchangeBase",
        [`${SemanticAttributes.CODE_FUNCTION}.params.orderId`]: id,
      },
      async () => {
        try {
          this.exchangeConfig.fetchOrderValidateInput(id)

          // call api
          const response = await this.exchange.fetchOrder(
            id,
            this.exchangeConfig.instrumentId,
          )
          this.logger.debug(
            { id, response },
            "exchange.fetchOrder({id}) returned: {response}",
          )

          this.exchangeConfig.fetchOrderValidateApiResponse(response)

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.result`]:
              JSON.stringify(response),
          })

          return {
            ok: true,
            value: {
              originalResponseAsIs: response,
              status: response.status as OrderStatus,
            },
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          return { ok: false, error: error }
        }
      },
    )
    return ret as Result<FetchOrderResult>
  }

  public async privateGetAccount(): Promise<Result<PrivateGetAccountResult>> {
    const ret = await asyncRunInSpan(
      "app.exchangeBase.privateGetAccount",
      {
        [SemanticAttributes.CODE_FUNCTION]: "privateGetAccount",
        [SemanticAttributes.CODE_NAMESPACE]: "app.exchangeBase",
      },
      async () => {
        try {
          this.exchangeConfig.privateGetAccountValidateCall()

          const response = await this.exchange.privateGetAccount()
          this.logger.debug(
            { response },
            "exchange.privateGetAccount() returned: {response}",
          )

          const result = this.exchangeConfig.privateGetAccountProcessApiResponse(response)

          const { originalResponseAsIs, ...logTheRest } = result
          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.result`]:
              JSON.stringify(logTheRest),
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
    return ret as Result<PrivateGetAccountResult>
  }

  public async fetchBalance(): Promise<Result<FetchBalanceResult>> {
    const ret = await asyncRunInSpan(
      "app.exchangeBase.fetchBalance",
      {
        [SemanticAttributes.CODE_FUNCTION]: "fetchBalance",
        [SemanticAttributes.CODE_NAMESPACE]: "app.exchangeBase",
      },
      async () => {
        try {
          this.exchangeConfig.fetchBalanceValidateCall()

          const response = await this.exchange.fetchBalance()
          this.logger.debug({ response }, "exchange.fetchBalance() returned: {response}")

          const result = this.exchangeConfig.fetchBalanceProcessApiResponse(response)

          const { originalResponseAsIs, ...logTheRest } = result
          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.result`]:
              JSON.stringify(logTheRest),
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
    return ret as Result<FetchBalanceResult>
  }

  public async fetchFundingAccountBalance(): Promise<
    Result<FetchFundingAccountBalanceResult>
  > {
    const ret = await asyncRunInSpan(
      "app.exchangeBase.fetchFundingAccountBalance",
      {
        [SemanticAttributes.CODE_FUNCTION]: "fetchFundingAccountBalance",
        [SemanticAttributes.CODE_NAMESPACE]: "app.exchangeBase",
      },
      async () => {
        try {
          const response = await this.exchange.fetchBalance({ instType: "funding" })
          this.logger.debug({ response }, "exchange.fetchBalance() returned: {response}")

          const btcFreeBalance = Number(response?.BTC?.free) || 0
          const btcUsedBalance = Number(response?.BTC?.used) || 0
          const btcTotalBalance = Number(response?.BTC?.total) || 0

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.result`]: JSON.stringify({
              btcFreeBalance,
              btcUsedBalance,
              btcTotalBalance,
            }),
          })

          return {
            ok: true,
            value: {
              originalResponseAsIs: response,
              btcFreeBalance: btcFreeBalance,
              btcUsedBalance: btcUsedBalance,
              btcTotalBalance: btcTotalBalance,
            },
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          return { ok: false, error: error }
        }
      },
    )
    return ret as Result<FetchFundingAccountBalanceResult>
  }

  public async fetchExchangeStatus(): Promise<Result<boolean>> {
    const ret = await asyncRunInSpan(
      "app.exchangeBase.fetchExchangeStatus",
      {
        [SemanticAttributes.CODE_FUNCTION]: "fetchExchangeStatus",
        [SemanticAttributes.CODE_NAMESPACE]: "app.exchangeBase",
      },
      async () => {
        try {
          const response = await this.exchange.fetchStatus({})
          this.logger.debug({ response }, "exchange.fetchStatus() returned: {response}")

          const exchangeIsAlive = response?.status === "ok"
          const lastUpdated = response?.updated
          const extraInfo = response?.info

          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.result`]: JSON.stringify({
              exchangeIsAlive,
              lastUpdated,
              extraInfo,
            }),
          })

          return {
            ok: true,
            value: exchangeIsAlive,
          }
        } catch (error) {
          recordExceptionInCurrentSpan({ error, level: ErrorLevel.Warn })
          return { ok: false, error: error }
        }
      },
    )
    return ret as Result<boolean>
  }

  public async fetchPosition(instrumentId: string): Promise<Result<FetchPositionResult>> {
    const ret = await asyncRunInSpan(
      "app.exchangeBase.fetchPosition",
      {
        [SemanticAttributes.CODE_FUNCTION]: "fetchPosition",
        [SemanticAttributes.CODE_NAMESPACE]: "app.exchangeBase",
        [`${SemanticAttributes.CODE_FUNCTION}.params.instrumentId`]: instrumentId,
      },
      async () => {
        try {
          this.exchangeConfig.fetchPositionValidateInput(instrumentId)

          const response = await this.exchange.fetchPosition(instrumentId)
          this.logger.debug(
            { instrumentId, response },
            "exchange.fetchPosition({instrumentId}) returned: {response}",
          )

          const result = this.exchangeConfig.fetchPositionProcessApiResponse(response)

          const { originalResponseAsIs, ...logTheRest } = result
          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.result`]:
              JSON.stringify(logTheRest),
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
    return ret as Result<FetchPositionResult>
  }

  public async fetchTicker(instrumentId: string): Promise<Result<FetchTickerResult>> {
    const ret = await asyncRunInSpan(
      "app.exchangeBase.fetchTicker",
      {
        [SemanticAttributes.CODE_FUNCTION]: "fetchTicker",
        [SemanticAttributes.CODE_NAMESPACE]: "app.exchangeBase",
        [`${SemanticAttributes.CODE_FUNCTION}.params.instrumentId`]: instrumentId,
      },
      async () => {
        try {
          this.exchangeConfig.fetchTickerValidateInput(instrumentId)

          const response = await this.exchange.fetchTicker(instrumentId)
          this.logger.debug(
            { instrumentId, response },
            "exchange.fetchTicker({instrumentId}) returned: {response}",
          )

          const result = this.exchangeConfig.fetchTickerProcessApiResponse(response)

          const { originalResponseAsIs, ...logTheRest } = result
          addAttributesToCurrentSpan({
            [`${SemanticAttributes.CODE_FUNCTION}.results.result`]:
              JSON.stringify(logTheRest),
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

    return ret as Result<FetchTickerResult>
  }

  abstract getAccountAndPositionRisk(
    btcPriceInUsd: number,
  ): Promise<Result<GetAccountAndPositionRiskResult>>

  abstract closePosition(instrumentId: string): Promise<Result<boolean>>

  abstract getInstrumentDetails(): Promise<Result<GetInstrumentDetailsResult>>

  abstract getPublicFundingRate(): Promise<Result<GetPublicFundingRateResult>>
  abstract getPublicMarkPrice(): Promise<Result<GetPublicMarkPriceResult>>
  abstract getMarketIndexTickers(): Promise<Result<GetMarketIndexTickersResult>>

  abstract setAccountConfiguration(): Promise<Result<SetAccountConfigurationResult>>

  abstract withdrawOnLightning(
    args: WithdrawOnLightningParameters,
  ): Promise<Result<WithdrawOnLightningResult>>
  abstract depositOnLightning(
    args: DepositOnLightningParameters,
  ): Promise<Result<DepositOnLightningResult>>

  abstract fetchTransactionHistory(
    args: GetTransactionHistoryParameters,
  ): Promise<Result<GetTransactionHistoryResult>>

  abstract fetchFundingRateHistory(
    args: GetFundingRateHistoryParameters,
  ): Promise<Result<GetFundingRateHistoryResult>>
}
