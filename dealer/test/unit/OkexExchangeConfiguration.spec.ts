import { SupportedExchange, SupportedInstrument } from "src/ExchangeConfiguration"
import {
  DestinationAddressType,
  MarginMode,
  OkexExchangeConfiguration,
} from "src/OkexExchangeConfiguration"
import {
  WithdrawParameters,
  CreateOrderParameters,
  SupportedChain,
  TradeCurrency,
  TradeSide,
  TradeType,
  ApiError,
  OrderStatus,
  FetchDepositsParameters,
  FundTransferStatus,
  FetchWithdrawalsParameters,
  TransferParameters,
  AccountType,
} from "src/ExchangeTradingType"
import { sat2btc } from "src/utils"

function getValidFetchDepositAddressResponse() {
  return {
    code: "0",
    info: {
      chain: "BTC-Bitcoin",
      ctAddr: "",
      ccy: "BTC",
      to: "18",
      addr: "bc1qsd8nldvfc6k6xrx4z604wtldfkpskah77l43jwjexe2uc37zvevqaku65g",
      selected: true,
    },
    msg: "",
  }
}

function getValidFetchDepositsResponse(args) {
  const address: string = args.address
  const amountInBtc: number = args.amountInBtc
  const status: FundTransferStatus = args.status
  return [
    [
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
    ],
  ]
}

function getValidFetchWithdrawalsResponse(args) {
  const address: string = args.address
  const amountInBtc: number = args.amountInBtc
  const status: FundTransferStatus = args.status
  return [
    [
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
    ],
  ]
}

function getProcessedFetchDepositAddressResponse() {
  const response = getValidFetchDepositAddressResponse()
  const chain = response.info.chain
  const currency = response.info.ccy
  const address = response.info.addr
  return {
    originalResponseAsIs: response,
    chain: chain,
    currency: currency,
    address: address,
  }
}

function getValidWithdrawValidateInput(): WithdrawParameters {
  const args: WithdrawParameters = {
    currency: TradeCurrency.BTC,
    quantity: 1,
    address: "validAddressString",
    params: {
      dest: DestinationAddressType.External,
      pwd: "pwd",
      fee: "0", // probably need to fetch from galoy wallet api
    },
  }
  return args
}

function getValidWithdrawResponse() {
  return {
    id: "67485",
    info: {
      amt: "0.1",
      wdId: "67485",
      ccy: "BTC",
      chain: "BTC-Bitcoin",
    },
  }
}

function getValidTransferValidateInput(): TransferParameters {
  const args: TransferParameters = {
    currency: TradeCurrency.BTC,
    quantity: 0.0014,
    fromAccount: AccountType.Trading,
    toAccount: AccountType.Funding,
    params: {
      instId: SupportedInstrument.OKEX_PERPETUAL_SWAP,
    },
  }
  return args
}

function getValidTransferResponse() {
  return {
    info: {
      amt: "0.0014",
      ccy: "BTC",
      from: "18",
      to: "6",
      transId: "431124825",
    },
    id: "431124825",
    currency: TradeCurrency.BTC,
    amount: 0.0014,
    fromAccount: AccountType.Trading,
    toAccount: AccountType.Funding,
  }
}

function getValidCreateMarketOrderValidateInput(): CreateOrderParameters {
  const args: CreateOrderParameters = {
    instrumentId: SupportedInstrument.OKEX_PERPETUAL_SWAP,
    type: TradeType.Market,
    side: TradeSide.Buy,
    quantity: 1,
    params: { tdMode: MarginMode.Cross },
  }
  return args
}

function getValidcreateMarketOrderValidateApiResponse() {
  return { id: "validId" }
}

function getValidFetchBalanceProcessApiResponse(args: {
  totalEq: number
  notionalLever: number
  btcFreeBalance: number
  btcTotalBalance: number
  btcUsedBalance: number
}) {
  return {
    info: {
      data: [
        {
          details: [{ notionalLever: args.notionalLever }],
          totalEq: `${args.totalEq}`,
        },
      ],
    },

    BTC: {
      free: args.btcFreeBalance,
      used: args.btcUsedBalance,
      total: args.btcTotalBalance,
    },
  }
}

function getProcessedFetchBalanceProcessApiResponse(response) {
  return {
    originalResponseAsIs: response,
    notionalLever: Number(response?.info?.data?.[0]?.details?.[0]?.notionalLever),
    btcFreeBalance: response?.BTC?.free,
    btcUsedBalance: response?.BTC?.used,
    btcTotalBalance: response?.BTC?.total,
    totalEq: Number(response.info.data[0].totalEq),
  }
}

function getValidFetchPositionProcessApiResponse() {
  return {
    info: {
      last: "44444.4",
      notionalUsd: "99.99999999999996",
      margin: "0.000615615271145",

      adl: "3",
      liqPx: "59884.07806250006",
      pos: "-1",
      posSide: "net",
      avgPx: "48123.9",
      upl: "0.0000010467393406",
      uplRatio: "0.0025186589675597",
      mgnRatio: "44.533951675653064",
      mmr: "0.0000083160652548",
      lever: "5",
    },
  }
}

function getProcessedFetchPositionProcessApiResponse(response) {
  return {
    originalResponseAsIs: response,
    last: Number(response.info.last),
    notionalUsd: Number(response.info.notionalUsd),
    margin: Number(response.info.margin),

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

function getValidFetchTickerProcessApiResponse() {
  return {
    symbol: "BTC-USD-SWAP",
    timestamp: 1627534560440,
    datetime: "2021-07-29T04:56:00.440Z",
    high: 40939.9,
    low: 38782.6,
    bid: 40014.1,
    bidVolume: 60,
    ask: 40014.2,
    askVolume: 643,
    vwap: 0.0025070800649317324,
    open: 39751.7,
    close: 40011,
    last: 40011,
    baseVolume: 12353898,
    quoteVolume: 30972.2114,
    info: {
      instType: "SWAP",
      instId: "BTC-USD-SWAP",
      last: "40011",
      lastSz: "88",
      askPx: "40014.2",
      askSz: "643",
      bidPx: "40014.1",
      bidSz: "60",
      open24h: "39751.7",
      high24h: "40939.9",
      low24h: "38782.6",
      volCcy24h: "30972.2114",
      vol24h: "12353898",
      ts: "1627534560440",
      sodUtc0: "40043.2",
      sodUtc8: "39708.6",
    },
  }
}

function getProcessedFetchTickerProcessApiResponse(response) {
  return {
    originalResponseAsIs: response,
    lastBtcPriceInUsd: response.last,
    bidInUsd: response.bid,
    askInUsd: response.ask,
  }
}

const falsyArgs = [null, undefined, NaN, 0, "", false]

describe("OkexExchangeConfiguration", () => {
  describe("constructor", () => {
    it("should return a OkexExchangeConfiguration", async () => {
      const configuration = new OkexExchangeConfiguration()
      expect(configuration).toBeInstanceOf(OkexExchangeConfiguration)
    })

    it("should use Okex exchange id", async () => {
      const configuration = new OkexExchangeConfiguration()
      expect(configuration.exchangeId).toBe(SupportedExchange.OKEX5)
    })

    it("should use Okex perpetual swap", async () => {
      const configuration = new OkexExchangeConfiguration()
      expect(configuration.instrumentId).toBe(SupportedInstrument.OKEX_PERPETUAL_SWAP)
    })
  })

  describe("fetchDepositAddressValidateInput", () => {
    it("should do nothing when currency is BTC", async () => {
      const configuration = new OkexExchangeConfiguration()
      const result = configuration.fetchDepositAddressValidateInput(TradeCurrency.BTC)
      expect(result).toBeUndefined()
    })

    it("should throw when currency is not BTC", async () => {
      const configuration = new OkexExchangeConfiguration()

      expect(() =>
        configuration.fetchDepositAddressValidateInput(TradeCurrency.USD),
      ).toThrowError(ApiError.UNSUPPORTED_CURRENCY)
    })
  })

  describe("fetchDepositAddressProcessApiResponse", () => {
    it("should throw when response is falsy", async () => {
      const configuration = new OkexExchangeConfiguration()
      falsyArgs.forEach((response) => {
        expect(() =>
          configuration.fetchDepositAddressProcessApiResponse(response),
        ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
      })
    })

    it("should throw when response has no info property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {}
      expect(() =>
        configuration.fetchDepositAddressProcessApiResponse(response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })

    it("should throw when response has no info.ccy property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {
        info: {
          chain: "BTC-Bitcoin",
          // ccy: "BTC",
          addr: "anything",
        },
      }
      expect(() =>
        configuration.fetchDepositAddressProcessApiResponse(response),
      ).toThrowError(ApiError.UNSUPPORTED_CURRENCY)
    })

    it("should throw when response has no info.addr property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {
        info: {
          chain: "BTC-Bitcoin",
          ccy: "BTC",
          // addr: "anything",
        },
      }
      expect(() =>
        configuration.fetchDepositAddressProcessApiResponse(response),
      ).toThrowError(ApiError.UNSUPPORTED_ADDRESS)
    })

    it(`should throw when response has no ${TradeCurrency.BTC} info.ccy property`, async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {
        info: {
          chain: "BTC-Bitcoin",
          ccy: "wrong",
          addr: "anything",
        },
      }
      expect(() =>
        configuration.fetchDepositAddressProcessApiResponse(response),
      ).toThrowError(ApiError.UNSUPPORTED_CURRENCY)
    })

    it("should throw when response has no valid info.addr property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {
        info: {
          chain: "BTC-Bitcoin",
          ccy: "BTC",
          addr: "",
        },
      }
      expect(() =>
        configuration.fetchDepositAddressProcessApiResponse(response),
      ).toThrowError(ApiError.UNSUPPORTED_ADDRESS)
    })

    it("should return processed response", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = getValidFetchDepositAddressResponse()
      const expected = getProcessedFetchDepositAddressResponse()
      const result = configuration.fetchDepositAddressProcessApiResponse(response)
      expect(result).toEqual(expected)
    })
  })

  describe("fetchDepositsValidateInput", () => {
    it("should do nothing when arguments are all valid", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchDepositsParameters
      const result = configuration.fetchDepositsValidateInput(args)
      expect(result).toBeUndefined()
    })
    it("should throw when address is invalid", async () => {
      const configuration = new OkexExchangeConfiguration()
      falsyArgs.forEach((falsyArg) => {
        const args = { address: falsyArg, amountInSats: 1 } as FetchDepositsParameters
        expect(() => configuration.fetchDepositsValidateInput(args)).toThrowError(
          ApiError.UNSUPPORTED_ADDRESS,
        )
      })
    })
    it("should throw when amountInSats is not positive", async () => {
      const configuration = new OkexExchangeConfiguration()
      const invalidAmountInSats = [0, -1]
      for (const amount of invalidAmountInSats) {
        const args = { address: "bc1q", amountInSats: amount } as FetchDepositsParameters
        expect(() => configuration.fetchDepositsValidateInput(args)).toThrowError(
          ApiError.NON_POSITIVE_QUANTITY,
        )
      }
    })
  })

  describe("fetchDepositsProcessApiResponse", () => {
    it("should throw when response is falsy", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchDepositsParameters
      falsyArgs.forEach((response) => {
        expect(() =>
          configuration.fetchDepositsProcessApiResponse(args, response),
        ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
      })
    })
    it("should throw when response has no sub array", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchDepositsParameters
      const response = []
      expect(() =>
        configuration.fetchDepositsProcessApiResponse(args, response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })
    it("should throw when response has no object in sub array", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchDepositsParameters
      const response = [[]]
      expect(() =>
        configuration.fetchDepositsProcessApiResponse(args, response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })
    it("should throw when response has object but no currency property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchDepositsParameters
      const response = [
        [
          {
            // currency: TradeCurrency.BTC,
            amount: sat2btc(args.amountInSats),
            address: args.address,
            status: "ok",
          },
        ],
      ]
      expect(() =>
        configuration.fetchDepositsProcessApiResponse(args, response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })
    it("should throw when response has object but currency not BTC", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchDepositsParameters
      const response = [
        [
          {
            currency: "NOT_BTC",
            amount: sat2btc(args.amountInSats),
            address: args.address,
            status: "ok",
          },
        ],
      ]
      expect(() =>
        configuration.fetchDepositsProcessApiResponse(args, response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })
    it("should throw when response has object but no amount property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchDepositsParameters
      const response = [
        [
          {
            currency: TradeCurrency.BTC,
            // amount: sat2btc(args.amountInSats),
            address: args.address,
            status: "ok",
          },
        ],
      ]
      expect(() =>
        configuration.fetchDepositsProcessApiResponse(args, response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })
    it("should throw when response has object but no address property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchDepositsParameters
      const response = [
        [
          {
            currency: TradeCurrency.BTC,
            amount: sat2btc(args.amountInSats),
            // address: args.address,
            status: "ok",
          },
        ],
      ]
      expect(() =>
        configuration.fetchDepositsProcessApiResponse(args, response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })
    it("should throw when response has object but no status property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchDepositsParameters
      const response = [
        [
          {
            currency: TradeCurrency.BTC,
            amount: sat2btc(args.amountInSats),
            address: args.address,
            // status: "ok",
          },
        ],
      ]
      expect(() =>
        configuration.fetchDepositsProcessApiResponse(args, response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })
    it("should throw when response does not match on address", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchDepositsParameters
      const responseValues = {
        address: `NOT_${args.address}`,
        amountInBtc: sat2btc(args.amountInSats),
        status: FundTransferStatus.Ok,
      }
      const validResponse = getValidFetchDepositsResponse(responseValues)
      expect(() =>
        configuration.fetchDepositsProcessApiResponse(args, validResponse),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })
    it("should throw when response does not match on amount", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchDepositsParameters
      const responseValues = {
        address: args.address,
        amountInBtc: sat2btc(12345 * args.amountInSats),
        status: FundTransferStatus.Ok,
      }
      const validResponse = getValidFetchDepositsResponse(responseValues)
      expect(() =>
        configuration.fetchDepositsProcessApiResponse(args, validResponse),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })
    it("should return correct result when one response is good", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchDepositsParameters
      const responseValues = {
        address: args.address,
        amountInBtc: sat2btc(args.amountInSats),
        status: FundTransferStatus.Ok,
      }
      const response = [
        [],
        [{}],
        [{}, {}],
        [
          {
            currency: TradeCurrency.BTC,
            amount: responseValues.amountInBtc,
            address: responseValues.address,
            status: responseValues.status,
          },
        ],
      ]
      const result = configuration.fetchDepositsProcessApiResponse(args, response)
      expect(result).toBeDefined()
      expect(result.currency).toBe(TradeCurrency.BTC)
      expect(result.address).toBe(responseValues.address)
      expect(result.amount).toBe(responseValues.amountInBtc)
      expect(result.status).toBe(responseValues.status)
      expect(result.originalResponseAsIs).toBe(response)
    })
    it("should return correct result when response is good", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchDepositsParameters
      const responseValues = {
        address: args.address,
        amountInBtc: sat2btc(args.amountInSats),
        status: FundTransferStatus.Ok,
      }
      const validResponse = getValidFetchDepositsResponse(responseValues)
      const result = configuration.fetchDepositsProcessApiResponse(args, validResponse)
      expect(result).toBeDefined()
      expect(result.currency).toBe(TradeCurrency.BTC)
      expect(result.address).toBe(responseValues.address)
      expect(result.amount).toBe(responseValues.amountInBtc)
      expect(result.status).toBe(responseValues.status)
      expect(result.originalResponseAsIs).toBe(validResponse)
    })
  })

  describe("withdrawValidateInput", () => {
    it(`should throw when response has no ${TradeCurrency.BTC} currency property`, async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = getValidWithdrawValidateInput()
      args.currency = TradeCurrency.USD
      expect(() => configuration.withdrawValidateInput(args)).toThrowError(
        ApiError.UNSUPPORTED_CURRENCY,
      )
    })

    it("should throw when response has non positive quantity property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = getValidWithdrawValidateInput()
      const invalidQuantity = [0, -1]
      for (const quantity of invalidQuantity) {
        args.quantity = quantity
        expect(() => configuration.withdrawValidateInput(args)).toThrowError(
          ApiError.NON_POSITIVE_QUANTITY,
        )
      }
    })

    it("should throw when response has no address property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = getValidWithdrawValidateInput()
      args.address = ""
      expect(() => configuration.withdrawValidateInput(args)).toThrowError(
        ApiError.UNSUPPORTED_ADDRESS,
      )
    })

    it("should do nothing when arguments are all valid", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = getValidWithdrawValidateInput()
      const result = configuration.withdrawValidateInput(args)
      expect(result).toBeUndefined()
    })
  })

  describe("withdrawValidateApiResponse", () => {
    it("should throw when response is falsy", async () => {
      const configuration = new OkexExchangeConfiguration()
      falsyArgs.forEach((response) => {
        expect(() => configuration.withdrawValidateApiResponse(response)).toThrowError()
      })
    })

    // TODO: add more failure test
    // TODO: add exchange specific post-processing

    it("should do nothing when response is valid", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = getValidWithdrawResponse()
      const result = configuration.withdrawValidateApiResponse(response)
      expect(result).toBeUndefined()
    })
  })

  describe("transferValidateInput", () => {
    it(`should throw when response has no ${TradeCurrency.BTC} currency property`, async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = getValidTransferValidateInput()
      args.currency = TradeCurrency.USD
      expect(() => configuration.transferValidateInput(args)).toThrowError(
        ApiError.UNSUPPORTED_CURRENCY,
      )
    })

    it("should throw when response has non positive quantity property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = getValidTransferValidateInput()
      const invalidQuantity = [0, -1]
      for (const quantity of invalidQuantity) {
        args.quantity = quantity
        expect(() => configuration.transferValidateInput(args)).toThrowError(
          ApiError.NON_POSITIVE_QUANTITY,
        )
      }
    })

    it("should do nothing when arguments are all valid", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = getValidTransferValidateInput()
      const result = configuration.transferValidateInput(args)
      expect(result).toBeUndefined()
    })
  })

  describe("transferValidateApiResponse", () => {
    it("should throw when response is falsy", async () => {
      const configuration = new OkexExchangeConfiguration()
      falsyArgs.forEach((response) => {
        expect(() => configuration.transferValidateApiResponse(response)).toThrowError()
      })
    })

    // TODO: add more failure test
    // TODO: add exchange specific post-processing

    it("should do nothing when response is valid", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = getValidTransferResponse()
      const result = configuration.transferValidateApiResponse(response)
      expect(result).toBeUndefined()
    })
  })

  describe("fetchWithdrawalsValidateInput", () => {
    it("should do nothing when arguments are all valid", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchWithdrawalsParameters
      const result = configuration.fetchWithdrawalsValidateInput(args)
      expect(result).toBeUndefined()
    })
    it("should throw when address is invalid", async () => {
      const configuration = new OkexExchangeConfiguration()
      falsyArgs.forEach((falsyArg) => {
        const args = { address: falsyArg, amountInSats: 1 } as FetchWithdrawalsParameters
        expect(() => configuration.fetchWithdrawalsValidateInput(args)).toThrowError(
          ApiError.UNSUPPORTED_ADDRESS,
        )
      })
    })
    it("should throw when amountInSats is not positive", async () => {
      const configuration = new OkexExchangeConfiguration()
      const invalidAmountInSats = [0, -1]
      for (const amount of invalidAmountInSats) {
        const args = {
          address: "bc1q",
          amountInSats: amount,
        } as FetchWithdrawalsParameters
        expect(() => configuration.fetchWithdrawalsValidateInput(args)).toThrowError(
          ApiError.NON_POSITIVE_QUANTITY,
        )
      }
    })
  })

  describe("fetchWithdrawalsProcessApiResponse", () => {
    it("should throw when response is falsy", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchWithdrawalsParameters
      falsyArgs.forEach((response) => {
        expect(() =>
          configuration.fetchWithdrawalsProcessApiResponse(args, response),
        ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
      })
    })
    it("should throw when response has no sub array", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchWithdrawalsParameters
      const response = []
      expect(() =>
        configuration.fetchWithdrawalsProcessApiResponse(args, response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })
    it("should throw when response has no object in sub array", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchWithdrawalsParameters
      const response = [[]]
      expect(() =>
        configuration.fetchWithdrawalsProcessApiResponse(args, response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })
    it("should throw when response has object but no currency property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchWithdrawalsParameters
      const response = [
        [
          {
            // currency: TradeCurrency.BTC,
            amount: sat2btc(args.amountInSats),
            address: args.address,
            status: "ok",
          },
        ],
      ]
      expect(() =>
        configuration.fetchWithdrawalsProcessApiResponse(args, response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })
    it("should throw when response has object but currency not BTC", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchWithdrawalsParameters
      const response = [
        [
          {
            currency: "NOT_BTC",
            amount: sat2btc(args.amountInSats),
            address: args.address,
            status: "ok",
          },
        ],
      ]
      expect(() =>
        configuration.fetchWithdrawalsProcessApiResponse(args, response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })
    it("should throw when response has object but no amount property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchWithdrawalsParameters
      const response = [
        [
          {
            currency: TradeCurrency.BTC,
            // amount: sat2btc(args.amountInSats),
            address: args.address,
            status: "ok",
          },
        ],
      ]
      expect(() =>
        configuration.fetchWithdrawalsProcessApiResponse(args, response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })
    it("should throw when response has object but no address property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchWithdrawalsParameters
      const response = [
        [
          {
            currency: TradeCurrency.BTC,
            amount: sat2btc(args.amountInSats),
            // address: args.address,
            status: "ok",
          },
        ],
      ]
      expect(() =>
        configuration.fetchWithdrawalsProcessApiResponse(args, response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })
    it("should throw when response has object but no status property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchWithdrawalsParameters
      const response = [
        [
          {
            currency: TradeCurrency.BTC,
            amount: sat2btc(args.amountInSats),
            address: args.address,
            // status: "ok",
          },
        ],
      ]
      expect(() =>
        configuration.fetchWithdrawalsProcessApiResponse(args, response),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })
    it("should throw when response does not match on address", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchWithdrawalsParameters
      const responseValues = {
        address: `NOT_${args.address}`,
        amountInBtc: sat2btc(args.amountInSats),
        status: FundTransferStatus.Ok,
      }
      const validResponse = getValidFetchWithdrawalsResponse(responseValues)
      expect(() =>
        configuration.fetchWithdrawalsProcessApiResponse(args, validResponse),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })
    it("should throw when response does not match on amount", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchWithdrawalsParameters
      const responseValues = {
        address: args.address,
        amountInBtc: sat2btc(12345 * args.amountInSats),
        status: FundTransferStatus.Ok,
      }
      const validResponse = getValidFetchWithdrawalsResponse(responseValues)
      expect(() =>
        configuration.fetchWithdrawalsProcessApiResponse(args, validResponse),
      ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
    })
    it("should return correct result when one response is good", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchWithdrawalsParameters
      const responseValues = {
        address: args.address,
        amountInBtc: sat2btc(args.amountInSats),
        status: FundTransferStatus.Ok,
      }
      const response = [
        [],
        [{}],
        [{}, {}],
        [
          {
            currency: TradeCurrency.BTC,
            amount: responseValues.amountInBtc,
            address: responseValues.address,
            status: responseValues.status,
          },
        ],
      ]
      const result = configuration.fetchWithdrawalsProcessApiResponse(args, response)
      expect(result).toBeDefined()
      expect(result.currency).toBe(TradeCurrency.BTC)
      expect(result.address).toBe(responseValues.address)
      expect(result.amount).toBe(responseValues.amountInBtc)
      expect(result.status).toBe(responseValues.status)
      expect(result.originalResponseAsIs).toBe(response)
    })
    it("should return correct result when response is good", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = { address: "bc1q", amountInSats: 1 } as FetchWithdrawalsParameters
      const responseValues = {
        address: args.address,
        amountInBtc: sat2btc(args.amountInSats),
        status: FundTransferStatus.Ok,
      }
      const validResponse = getValidFetchWithdrawalsResponse(responseValues)
      const result = configuration.fetchWithdrawalsProcessApiResponse(args, validResponse)
      expect(result).toBeDefined()
      expect(result.currency).toBe(TradeCurrency.BTC)
      expect(result.address).toBe(responseValues.address)
      expect(result.amount).toBe(responseValues.amountInBtc)
      expect(result.status).toBe(responseValues.status)
      expect(result.originalResponseAsIs).toBe(validResponse)
    })
  })

  describe("createMarketOrderValidateInput", () => {
    it("should throw when arguments is not a supported side property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = getValidCreateMarketOrderValidateInput()
      for (const tradeSide in TradeSide) {
        if (tradeSide !== TradeSide.Buy && tradeSide !== TradeSide.Sell) {
          args.side = tradeSide as TradeSide
          expect(() => configuration.createMarketOrderValidateInput(args)).toThrowError(
            ApiError.INVALID_TRADE_SIDE,
          )
        }
      }
    })

    it("should throw when arguments has non positive quantity property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const args = getValidCreateMarketOrderValidateInput()
      const invalidQuantity = [0, -1]
      for (const quantity of invalidQuantity) {
        args.quantity = quantity
        expect(() => configuration.createMarketOrderValidateInput(args)).toThrowError(
          ApiError.NON_POSITIVE_QUANTITY,
        )
      }
    })
  })

  describe("createMarketOrderValidateApiResponse", () => {
    it("should throw when response is falsy", async () => {
      const configuration = new OkexExchangeConfiguration()
      falsyArgs.forEach((response) => {
        expect(() =>
          configuration.createMarketOrderValidateApiResponse(response),
        ).toThrowError(ApiError.UNSUPPORTED_API_RESPONSE)
      })
    })

    it("should throw when response has no id property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {}
      expect(() =>
        configuration.createMarketOrderValidateApiResponse(response),
      ).toThrowError(ApiError.MISSING_ORDER_ID)
    })

    it("should throw when response has missing value id property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = getValidcreateMarketOrderValidateApiResponse()
      response.id = ""
      expect(() =>
        configuration.createMarketOrderValidateApiResponse(response),
      ).toThrowError(ApiError.MISSING_ORDER_ID)
    })

    it("should do nothing when response is valid", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = getValidcreateMarketOrderValidateApiResponse()
      const result = configuration.createMarketOrderValidateApiResponse(response)
      expect(result).toBeUndefined()
    })
  })

  describe("fetchOrderValidateInput", () => {
    it("should throw when id is falsy", async () => {
      const configuration = new OkexExchangeConfiguration()
      const id = ""
      expect(() => configuration.fetchOrderValidateInput(id)).toThrowError(
        ApiError.MISSING_PARAMETERS,
      )
    })

    it("should do nothing when id is truthy", async () => {
      const configuration = new OkexExchangeConfiguration()
      const id = "validId"
      const result = configuration.fetchOrderValidateInput(id)
      expect(result).toBeUndefined()
    })
  })

  describe("fetchOrderValidateApiResponse", () => {
    it("should throw when response is falsy", async () => {
      const configuration = new OkexExchangeConfiguration()
      falsyArgs.forEach((response) => {
        expect(() => configuration.fetchOrderValidateApiResponse(response)).toThrowError(
          ApiError.UNSUPPORTED_API_RESPONSE,
        )
      })
    })

    it("should throw when response has no id property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {}
      expect(() => configuration.fetchOrderValidateApiResponse(response)).toThrowError(
        ApiError.MISSING_ORDER_ID,
      )
    })

    it("should throw when response.id is not a supported id property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = { id: "" }
      expect(() => configuration.fetchOrderValidateApiResponse(response)).toThrowError(
        ApiError.MISSING_ORDER_ID,
      )
    })

    it("should throw when response has no status property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = { id: "id" }
      expect(() => configuration.fetchOrderValidateApiResponse(response)).toThrowError(
        ApiError.UNSUPPORTED_API_RESPONSE,
      )
    })

    it("should throw when response.status is not a supported OrderStatus property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = { id: "id", status: "" }
      expect(() => configuration.fetchOrderValidateApiResponse(response)).toThrowError(
        ApiError.UNSUPPORTED_API_RESPONSE,
      )
    })

    it("should do nothing when response is valid", async () => {
      const configuration = new OkexExchangeConfiguration()
      for (const status in OrderStatus) {
        const response = { id: "id", status: status }
        const result = configuration.fetchOrderValidateApiResponse(response)
        expect(result).toBeUndefined()
      }
    })
  })

  describe("privateGetAccountValidateCall", () => {
    it("should throw not supported for okex", async () => {
      const configuration = new OkexExchangeConfiguration()
      expect(() => configuration.privateGetAccountValidateCall()).toThrowError(
        ApiError.NOT_SUPPORTED,
      )
    })
  })

  describe("privateGetAccountProcessApiResponse", () => {
    it("should throw not supported for okex", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {}
      expect(() =>
        configuration.privateGetAccountProcessApiResponse(response),
      ).toThrowError(ApiError.NOT_SUPPORTED)
    })
  })

  describe("fetchBalanceValidateCall", () => {
    it("should throw not implemented for now", async () => {
      const configuration = new OkexExchangeConfiguration()
      const result = configuration.fetchBalanceValidateCall()
      expect(result).toBeUndefined()
    })
  })

  describe("fetchBalanceProcessApiResponse", () => {
    it("should throw when response is falsy", async () => {
      const configuration = new OkexExchangeConfiguration()
      falsyArgs.forEach((response) => {
        expect(() => configuration.fetchBalanceProcessApiResponse(response)).toThrowError(
          ApiError.UNSUPPORTED_API_RESPONSE,
        )
      })
    })

    it("should throw when response has no info property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {
        not_info: {
          data: [
            {
              totalEq: "100",
            },
          ],
        },
      }
      expect(() => configuration.fetchBalanceProcessApiResponse(response)).toThrowError(
        ApiError.MISSING_ACCOUNT_VALUE,
      )
    })

    it("should throw when response has no info.data property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {
        info: {
          not_data: [
            {
              totalEq: "100",
            },
          ],
        },
      }
      expect(() => configuration.fetchBalanceProcessApiResponse(response)).toThrowError(
        ApiError.MISSING_ACCOUNT_VALUE,
      )
    })

    it("should throw when response info.data array is empty property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {
        info: {
          data: [],
        },
      }
      expect(() => configuration.fetchBalanceProcessApiResponse(response)).toThrowError(
        ApiError.MISSING_ACCOUNT_VALUE,
      )
    })

    it("should throw when response has no info.data[0].totalEq property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {
        info: {
          data: [
            {
              not_totalEq: "100",
            },
          ],
        },
      }
      expect(() => configuration.fetchBalanceProcessApiResponse(response)).toThrowError(
        ApiError.MISSING_ACCOUNT_VALUE,
      )
    })

    it("should throw when response info.data[0].totalEq property is not a number", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {
        info: {
          data: [
            {
              totalEq: true,
            },
          ],
        },
      }
      expect(() => configuration.fetchBalanceProcessApiResponse(response)).toThrowError(
        ApiError.MISSING_ACCOUNT_VALUE,
      )
    })

    it("should return processed response when info.data[0].totalEq property is negative, positive or zero", async () => {
      const configuration = new OkexExchangeConfiguration()
      const validTotalEq = [-1, 0, 1]
      for (const totalEq of validTotalEq) {
        const response = getValidFetchBalanceProcessApiResponse({
          totalEq: totalEq,
          notionalLever: 56,
          btcFreeBalance: 78,
          btcUsedBalance: 90,
          btcTotalBalance: 12,
        })
        const expected = getProcessedFetchBalanceProcessApiResponse(response)
        const result = configuration.fetchBalanceProcessApiResponse(response)
        expect(result).toEqual(expected)
        expect(result.totalEq).toEqual(Number(totalEq))
      }
    })

    it("should return processed response when response is valid", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = getValidFetchBalanceProcessApiResponse({
        totalEq: 1234,
        notionalLever: 56,
        btcFreeBalance: 78,
        btcUsedBalance: 90,
        btcTotalBalance: 12,
      })
      const expected = getProcessedFetchBalanceProcessApiResponse(response)
      const result = configuration.fetchBalanceProcessApiResponse(response)
      expect(result).toEqual(expected)
    })
  })

  describe("fetchPositionValidateInput", () => {
    it("should throw when instrumentId is not supported", async () => {
      const configuration = new OkexExchangeConfiguration()
      const id = "wrong"
      expect(() => configuration.fetchPositionValidateInput(id)).toThrowError(
        ApiError.UNSUPPORTED_INSTRUMENT,
      )
    })

    it("should do nothing when instrumentId is supported", async () => {
      const configuration = new OkexExchangeConfiguration()
      const instrumentId = SupportedInstrument.OKEX_PERPETUAL_SWAP
      const result = configuration.fetchPositionValidateInput(instrumentId)
      expect(result).toBeUndefined()
    })
  })

  describe("fetchPositionProcessApiResponse", () => {
    it("should throw when response is falsy", async () => {
      const configuration = new OkexExchangeConfiguration()
      falsyArgs.forEach((response) => {
        expect(() =>
          configuration.fetchPositionProcessApiResponse(response),
        ).toThrowError(ApiError.EMPTY_API_RESPONSE)
      })
    })

    it("should throw when response has no last property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {
        info: {
          // last: "44444.4",
          notionalUsd: "99.99999999999996",
          margin: "0.000615615271145",
        },
      }
      expect(() => configuration.fetchPositionProcessApiResponse(response)).toThrowError(
        ApiError.UNSUPPORTED_API_RESPONSE,
      )
    })

    it("should throw when response last property is not a number", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {
        info: {
          last: true,
          notionalUsd: "99.99999999999996",
          margin: "0.000615615271145",
        },
      }
      expect(() => configuration.fetchPositionProcessApiResponse(response)).toThrowError(
        ApiError.UNSUPPORTED_API_RESPONSE,
      )
    })

    it("should throw when response has no notionalUsd property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {
        info: {
          last: "44444.4",
          // notionalUsd: "99.99999999999996",
          margin: "0.000615615271145",
        },
      }
      expect(() => configuration.fetchPositionProcessApiResponse(response)).toThrowError(
        ApiError.UNSUPPORTED_API_RESPONSE,
      )
    })

    it("should throw when response notionalUsd property is not a number", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {
        info: {
          last: "44444.4",
          notionalUsd: true,
          margin: "0.000615615271145",
        },
      }
      expect(() => configuration.fetchPositionProcessApiResponse(response)).toThrowError(
        ApiError.UNSUPPORTED_API_RESPONSE,
      )
    })

    it("should throw when response has no margin property", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {
        info: {
          last: "44444.4",
          notionalUsd: "99.99999999999996",
          // margin: "0.000615615271145",
        },
      }
      expect(() => configuration.fetchPositionProcessApiResponse(response)).toThrowError(
        ApiError.UNSUPPORTED_API_RESPONSE,
      )
    })

    it("should throw when response margin property is not a number", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = {
        info: {
          last: "44444.4",
          notionalUsd: "99.99999999999996",
          margin: true,
        },
      }
      expect(() => configuration.fetchPositionProcessApiResponse(response)).toThrowError(
        ApiError.UNSUPPORTED_API_RESPONSE,
      )
    })

    it("should return processed response when response is valid", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = getValidFetchPositionProcessApiResponse()
      const expected = getProcessedFetchPositionProcessApiResponse(response)
      const result = configuration.fetchPositionProcessApiResponse(response)
      expect(result).toEqual(expected)
    })
  })

  describe("fetchTickerValidateInput", () => {
    it("should throw when instrumentId is not supported", async () => {
      const configuration = new OkexExchangeConfiguration()
      const id = "wrong"
      expect(() => configuration.fetchTickerValidateInput(id)).toThrowError(
        ApiError.UNSUPPORTED_INSTRUMENT,
      )
    })

    it("should do nothing when instrumentId is supported", async () => {
      const configuration = new OkexExchangeConfiguration()
      const instrumentId = SupportedInstrument.OKEX_PERPETUAL_SWAP
      const result = configuration.fetchTickerValidateInput(instrumentId)
      expect(result).toBeUndefined()
    })
  })

  describe("fetchTickerProcessApiResponse", () => {
    it("should throw when response is falsy", async () => {
      const configuration = new OkexExchangeConfiguration()
      falsyArgs.forEach((response) => {
        expect(() => configuration.fetchTickerProcessApiResponse(response)).toThrowError(
          ApiError.UNSUPPORTED_API_RESPONSE,
        )
      })
    })

    it("should return processed response when response is valid", async () => {
      const configuration = new OkexExchangeConfiguration()
      const response = getValidFetchTickerProcessApiResponse()
      const expected = getProcessedFetchTickerProcessApiResponse(response)
      const result = configuration.fetchTickerProcessApiResponse(response)
      expect(result).toEqual(expected)
    })
  })
})
