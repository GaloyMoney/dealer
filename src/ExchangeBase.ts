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
} from "./ExchangeTradingType"
import { Result } from "./Result"
import ccxt, { ExchangeId } from "ccxt"
import { ExchangeConfiguration } from "./ExchangeConfiguration"
import pino from "pino"

export abstract class ExchangeBase {
  exchangeConfig: ExchangeConfiguration
  exchangeId: ExchangeId
  fundingPassword: string
  exchange: ccxt.okex5
  logger: pino.Logger

  constructor(exchangeConfig: ExchangeConfiguration, logger: pino.Logger) {
    this.exchangeConfig = exchangeConfig
    this.exchangeId = exchangeConfig.exchangeId as ExchangeId

    const apiKey = process.env[`${this.exchangeId.toUpperCase()}_KEY`]
    const secret = process.env[`${this.exchangeId.toUpperCase()}_SECRET`]
    const password = process.env[`${this.exchangeId.toUpperCase()}_PASSWORD`]
    const fundingPassword = process.env[`${this.exchangeId.toUpperCase()}_FUND_PASSWORD`]

    if (!apiKey || !secret || !password || !fundingPassword) {
      throw new Error(`Missing ${this.exchangeId} exchange environment variables`)
    }

    this.fundingPassword = fundingPassword

    const exchangeClass = ccxt[this.exchangeId]
    this.exchange = new exchangeClass({ apiKey, secret, password })

    this.exchange.options["createMarketBuyOrderRequiresPrice"] = false

    // The following check throws if something is wrong
    this.exchange.checkRequiredCredentials()

    this.logger = logger.child({ class: `${ExchangeBase.name}-${this.exchangeId}` })
  }

  public async fetchDepositAddress(
    currency: string,
  ): Promise<Result<FetchDepositAddressResult>> {
    try {
      this.exchangeConfig.fetchDepositAddressValidateInput(currency)

      const response = await this.exchange.fetchDepositAddress(currency)
      this.logger.debug(
        { currency, response },
        "exchange.fetchDepositAddress({currency}) returned: {response}",
      )

      const result = this.exchangeConfig.fetchDepositAddressProcessApiResponse(response)

      return {
        ok: true,
        value: result,
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  public async fetchDeposits(
    args: FetchDepositsParameters,
  ): Promise<Result<FetchDepositsResult>> {
    try {
      this.exchangeConfig.fetchDepositsValidateInput(args)

      // No way to filter on request, so get them all...
      const response = await this.fetchDepositsAllPages(args)
      this.logger.debug(
        { args, response },
        "exchange.fetchDeposits({args}) returned: {response}",
      )

      // ...then filter
      const result = this.exchangeConfig.fetchDepositsProcessApiResponse(args, response)

      return {
        ok: true,
        value: result,
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  private async fetchDepositsAllPages(args: FetchDepositsParameters) {
    try {
      let page = 0
      const allDeposits: unknown[] = []
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
      return allDeposits
    } catch (error) {
      this.logger.debug({ error }, "Error in fetchDepositsAllPages()" + error.message)
      throw error
    }
  }

  public async withdraw(args: WithdrawParameters): Promise<Result<WithdrawResult>> {
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

      return {
        ok: true,
        value: {
          originalResponseAsIs: response,
          id: response.id,
        },
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  public async fetchWithdrawals(
    args: FetchWithdrawalsParameters,
  ): Promise<Result<FetchWithdrawalsResult>> {
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
      return { ok: false, error: error }
    }
  }

  private async fetchWithdrawalsAllPages(args: FetchWithdrawalsParameters) {
    try {
      let page = 0
      const allWithdrawals: unknown[] = []
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
      return allWithdrawals
    } catch (error) {
      this.logger.debug({ error }, "Error in fetchWithdrawalsAllPages()" + error.message)
      throw error
    }
  }

  public async createMarketOrder(
    args: CreateOrderParameters,
  ): Promise<Result<CreateOrderResult>> {
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

      return {
        ok: true,
        value: {
          originalResponseAsIs: response,
          id: response.id,
        },
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  public async fetchOrder(id: string): Promise<Result<FetchOrderResult>> {
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

      return {
        ok: true,
        value: {
          originalResponseAsIs: response,
          status: response.status as OrderStatus,
        },
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  public async privateGetAccount(): Promise<Result<PrivateGetAccountResult>> {
    try {
      this.exchangeConfig.privateGetAccountValidateCall()

      const response = await this.exchange.privateGetAccount()
      this.logger.debug({ response }, "exchange.privateGetAccount() returned: {response}")

      const result = this.exchangeConfig.privateGetAccountProcessApiResponse(response)

      return {
        ok: true,
        value: result,
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  public async fetchBalance(): Promise<Result<FetchBalanceResult>> {
    try {
      this.exchangeConfig.fetchBalanceValidateCall()

      const response = await this.exchange.fetchBalance()
      this.logger.debug({ response }, "exchange.fetchBalance() returned: {response}")

      const result = this.exchangeConfig.fetchBalanceProcessApiResponse(response)

      return {
        ok: true,
        value: result,
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  public async fetchPosition(instrumentId: string): Promise<Result<FetchPositionResult>> {
    try {
      this.exchangeConfig.fetchPositionValidateInput(instrumentId)

      const response = await this.exchange.fetchPosition(instrumentId)
      this.logger.debug(
        { instrumentId, response },
        "exchange.fetchPosition({instrumentId}) returned: {response}",
      )

      const result = this.exchangeConfig.fetchPositionProcessApiResponse(response)

      return {
        ok: true,
        value: result,
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  public async fetchTicker(instrumentId: string): Promise<Result<FetchTickerResult>> {
    try {
      this.exchangeConfig.fetchTickerValidateInput(instrumentId)

      const response = await this.exchange.fetchTicker(instrumentId)
      this.logger.debug(
        { instrumentId, response },
        "exchange.fetchTicker({instrumentId}) returned: {response}",
      )

      const result = this.exchangeConfig.fetchTickerProcessApiResponse(response)

      return {
        ok: true,
        value: result,
      }
    } catch (error) {
      return { ok: false, error: error }
    }
  }

  abstract getAccountAndPositionRisk(
    btcPriceInUsd: number,
  ): Promise<Result<GetAccountAndPositionRiskResult>>

  abstract getInstrumentDetails(): Promise<Result<GetInstrumentDetailsResult>>

  abstract getPublicFundingRate(): Promise<Result<GetPublicFundingRateResult>>
  abstract getPublicMarkPrice(): Promise<Result<GetPublicMarkPriceResult>>
  abstract getMarketIndexTickers(): Promise<Result<GetMarketIndexTickersResult>>

  abstract setAccountConfiguration(): Promise<Result<SetAccountConfigurationResult>>
}
