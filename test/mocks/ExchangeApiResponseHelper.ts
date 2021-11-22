import dateFormat from "dateformat"
import { SupportedInstrument } from "src/ExchangeConfiguration"
import { OrderStatus, FundTransferStatus, TradeCurrency } from "src/ExchangeTradingType"
import { MarginMode, PositionMode } from "src/OkexExchangeConfiguration"

export const DATE_FORMAT_STRING = "yyyymmddHHMMss"

export function getValidFetchDepositAddressResponse() {
  const datetime = dateFormat(new Date(), DATE_FORMAT_STRING)
  const address = `bc1q00exchange00000000000000000000000000datetime${datetime}`
  return {
    code: "0",
    data: [
      {
        chain: "BTC-Bitcoin",
        ctAddr: "",
        ccy: "BTC",
        to: "18",
        addr: address,
        // addr: addr,
        selected: true,
      },
    ],
    msg: "",
  }
}

export function getValidFetchDepositsResponse(args) {
  const address: string = args.address
  const amountInBtc: number = args.amountInBtc
  const status: FundTransferStatus = args.status
  return [
    {
      info: {
        ccy: TradeCurrency.BTC,
        chain: "BTC-Bitcoin",
        amt: `${amountInBtc}`,
        to: address,
      },
      currency: TradeCurrency.BTC,
      amount: amountInBtc,
      addressTo: address,
      address: address,
      status: status,
      type: "deposit",
      fee: {
        currency: TradeCurrency.BTC,
        cost: 0,
      },
      page: 0,
    },
  ]
}

export function getValidWithdrawResponse(id: string, currency, amountInBtc) {
  return {
    id: id,
    status: FundTransferStatus.Requested,
    info: {
      code: "0",
      msg: "",
      data: [
        {
          amt: amountInBtc,
          wdId: id,
          ccy: currency,
          chain: "BTC-Bitcoin",
        },
      ],
    },
  }
}

export function getValidFetchWithdrawalsResponse(args) {
  const address: string = args.address
  const amountInBtc: number = args.amountInBtc
  const status: FundTransferStatus = args.status
  return [
    {
      info: {
        ccy: TradeCurrency.BTC,
        chain: "BTC-Bitcoin",
        amt: `${amountInBtc}`,
        to: address,
      },
      currency: TradeCurrency.BTC,
      amount: amountInBtc,
      addressTo: address,
      address: address,
      status: status,
      type: "withdrawal",
      fee: {
        currency: TradeCurrency.BTC,
        cost: 0,
      },
      page: 0,
    },
  ]
}

export function getValidCreateMarketOrderResponse(id: number) {
  return { id: `${id}` }
}

export function getValidFetchOrderResponse(
  id: string,
  instrumentId: string,
  status: OrderStatus,
) {
  return { id: id, status: status }
}

export function getValidFetchBalanceResponse(
  balance: number,
  btcUsed: number,
  btcTotal: number,
) {
  return {
    info: {
      data: [
        {
          totalEq: `${balance}`,
        },
      ],
    },
    BTC: {
      used: `${btcUsed}`,
      total: `${btcTotal}`,
    },
  }
}

export function getValidFetchPositionResponse(
  last: number,
  notionalUsd: number,
  margin: number,
) {
  return {
    info: {
      last: `${last}`,
      notionalUsd: `${notionalUsd}`,
      margin: `${margin}`,
    },
  }
}

export function getValidFetchTickerResponse(instrumentId: string, last: number) {
  return {
    symbol: `${instrumentId}`,
    last: last,
    info: {
      instId: `${instrumentId}`,
      last: `${last}`,
    },
  }
}

export function getValidPublicGetPublicInstrumentsResponse({ instType, instId }) {
  const contractValue = 100
  const contractMinimumSize = 1
  const contractValueCurrency = TradeCurrency.USD
  return {
    code: "0",
    data: [
      {
        ctVal: `${contractValue}`,
        minSz: `${contractMinimumSize}`,
        ctValCcy: `${contractValueCurrency}`,
        instId: `${instId}`,
        instType: `${instType}`,
      },
    ],
    msg: "",
  }
}

export function getValidPrivatePostAccountSetPositionModeResponse(args: {
  posMode: PositionMode
}) {
  return {
    code: "0",
    data: [
      {
        posMode: `${args.posMode}`,
      },
    ],
    msg: "",
  }
}

export function getValidPrivatePostAccountSetLeverageResponse(args: {
  instrumentId: SupportedInstrument
  lever: number
  marginMode: MarginMode
}) {
  return {
    code: "0",
    data: [
      {
        instId: `${args.instrumentId}`,
        lever: `${args.lever}`,
        mgnMode: `${args.marginMode}`,
      },
    ],
    msg: "",
  }
}
