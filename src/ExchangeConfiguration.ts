import {
  FetchDepositAddressResult,
  WithdrawParameters,
  CreateOrderParameters,
  PrivateGetAccountResult,
  FetchBalanceResult,
  FetchPositionResult,
  FetchTickerResult,
  FetchDepositsResult,
  FetchWithdrawalsResult,
  FetchWithdrawalsParameters,
  FetchDepositsParameters,
  //   GetAccountAndPositionRiskResult,
  //   GetInstrumentDetailsResult,
} from "./ExchangeTradingType"
// import { Result } from "./Result"

export enum SupportedExchange {
  OKEX5 = "okex5",
}
export enum SupportedInstrument {
  OKEX_PERPETUAL_SWAP = "BTC-USD-SWAP",
  OKEX_BTC_USD_SPOT = "BTC-USD",
}

export enum SupportedInstrumentType {
  Margin = "MARGIN",
  Swap = "SWAP",
  Futures = "FUTURES",
  Option = "OPTION",
}

export interface Headers {
  [key: string]: unknown
}

export interface ExchangeConfiguration {
  exchangeId: SupportedExchange
  instrumentId: SupportedInstrument
  headers: Headers

  fetchDepositAddressValidateInput(currency: string)
  fetchDepositAddressProcessApiResponse(response): FetchDepositAddressResult

  fetchDepositsValidateInput(args: FetchDepositsParameters)
  fetchDepositsProcessApiResponse(
    args: FetchDepositsParameters,
    response,
  ): FetchDepositsResult

  withdrawValidateInput(args: WithdrawParameters)
  withdrawValidateApiResponse(response)

  fetchWithdrawalsValidateInput(args: FetchWithdrawalsParameters)
  fetchWithdrawalsProcessApiResponse(
    args: FetchWithdrawalsParameters,
    response,
  ): FetchWithdrawalsResult

  createMarketOrderValidateInput(args: CreateOrderParameters)
  createMarketOrderValidateApiResponse(response)

  fetchOrderValidateInput(id: string)
  fetchOrderValidateApiResponse(response)

  privateGetAccountValidateCall()
  privateGetAccountProcessApiResponse(response): PrivateGetAccountResult

  fetchBalanceValidateCall()
  fetchBalanceProcessApiResponse(response): FetchBalanceResult

  fetchPositionValidateInput(instrumentId: string)
  fetchPositionProcessApiResponse(response): FetchPositionResult

  fetchTickerValidateInput(instrumentId: string)
  fetchTickerProcessApiResponse(response): FetchTickerResult

  //   getAccountAndPositionRisk(
  //     btcPriceInUsd: number,
  //   ): Promise<Result<GetAccountAndPositionRiskResult>>

  //   getInstrumentDetails(): Promise<Result<GetInstrumentDetailsResult>>
}
