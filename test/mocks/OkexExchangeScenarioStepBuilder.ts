import dateFormat from "dateformat"
import { UpdatedPositionAndLeverageResult } from "src/Dealer"
import {
  OrderStatus,
  FundTransferStatus,
  TradeCurrency,
  CreateOrderParameters,
} from "src/ExchangeTradingType"
import { Position, UpdatedBalance, UpdatedPosition } from "src/HedgingStrategyTypes"
import { Result } from "src/Result"
import { sat2btc } from "src/utils"

const DATE_FORMAT_STRING = "yyyymmddHHMMss"

function getValidFetchDepositAddressResponse() {
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

function getValidFetchDepositsResponse(args) {
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

function getValidWithdrawResponse(id: string, currency, amountInBtc) {
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

function getValidFetchWithdrawalsResponse(args) {
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

function getValidCreateMarketOrderResponse(id: number) {
  return { id: `${id}` }
}

function getValidFetchOrderResponse(
  id: string,
  instrumentId: string,
  status: OrderStatus,
) {
  return { id: id, status: status }
}

function getValidFetchBalanceResponse(balance: number) {
  return {
    info: {
      data: [
        {
          totalEq: `${balance}`,
        },
      ],
    },
  }
}

function getValidFetchPositionResponse(
  last: number,
  notionalUsd: number,
  margin: number,
) {
  return {
    last: `${last}`,
    notionalUsd: `${notionalUsd}`,
    margin: `${margin}`,
  }
}

function getValidFetchTickerResponse(instrumentId: string, last: number) {
  return {
    symbol: `${instrumentId}`,
    last: last,
    info: {
      instId: `${instrumentId}`,
      last: `${last}`,
    },
  }
}

function getValidPublicGetPublicInstrumentsResponse({ instType, instId }) {
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

export interface StepInput {
  lastPriceInUsd: number
  liabilityInUsd: number
  notionalUsd: number
  notionalUsdAfterOrder: number
  marginInBtc: number
  totalEquity: number
  hasMinimalLiability: boolean
  isOrderExpected: boolean
  isOrderSizeOk: boolean
  orderId: number
  firstOrderStatus: OrderStatus
  numberFetchIteration: number
  lastOrderStatus: OrderStatus

  wasFundTransferExpected: boolean
  wasTransferWithdraw: boolean

  isFundTransferExpected: boolean
  isTransferWithdraw: boolean

  comment: string
  // updatePositionSkipped: boolean // !hasMinimalLiability
  expectPositionUpdatedOk: boolean
  // updateLeverageSkipped: boolean // !isFundTransferExpected
  expectLeverageUpdatedOk: boolean
}

export interface ExpectedResult {
  comment: string
  result: UpdatedPositionAndLeverageResult
}

export interface ExchangeMock {
  checkRequiredCredentials: jest.Mock
  last_json_response: jest.Mock
  fetchDeposits: jest.Mock
  fetchWithdrawals: jest.Mock
  fetchTicker: jest.Mock
  fetchPosition: jest.Mock
  fetchBalance: jest.Mock
  publicGetPublicInstruments: jest.Mock
  createMarketOrder: jest.Mock
  fetchOrder: jest.Mock
  withdraw: jest.Mock
  fetchDepositAddress: jest.Mock
}

export interface WalletMock {
  getWalletUsdBalance: jest.Mock
  getWalletOnChainDepositAddress: jest.Mock
  payOnChain: jest.Mock
}

export class OkexExchangeScenarioStepBuilder {
  private exchangeMockObject: ExchangeMock
  private walletMockObject: WalletMock

  private expectedResults = [] as ExpectedResult[]

  constructor() {
    this.exchangeMockObject = {
      checkRequiredCredentials: jest.fn().mockReturnValue(true),
      last_json_response: jest
        .fn()
        .mockReturnValue(new Map<string, number>([["cursor", 0]])),
      fetchDeposits: jest.fn(),
      fetchWithdrawals: jest.fn(),
      fetchTicker: jest.fn(),
      fetchPosition: jest.fn(),
      fetchBalance: jest.fn(),
      publicGetPublicInstruments: jest.fn(),
      createMarketOrder: jest.fn(),
      fetchOrder: jest.fn(),
      withdraw: jest.fn(),
      fetchDepositAddress: jest.fn(),
    }

    this.walletMockObject = {
      getWalletUsdBalance: jest.fn(),
      getWalletOnChainDepositAddress: jest.fn(),
      payOnChain: jest.fn(),
    }
  }

  public getExchangeMockObject(): ExchangeMock {
    return this.exchangeMockObject
  }

  public getWalletMockObject(): WalletMock {
    return this.walletMockObject
  }

  public getExpectedValues(): ExpectedResult[] {
    return this.expectedResults
  }

  public addScenarioStep(args: StepInput) {
    const {
      lastPriceInUsd,
      liabilityInUsd,
      // notionalUsd,
      notionalUsdAfterOrder,
      marginInBtc,
      totalEquity,
      hasMinimalLiability,
      isOrderExpected,
      isOrderSizeOk,
      orderId,
      firstOrderStatus,
      numberFetchIteration,
      lastOrderStatus,

      wasFundTransferExpected,
      wasTransferWithdraw,

      isFundTransferExpected,
      isTransferWithdraw,

      comment,
      expectPositionUpdatedOk,
      expectLeverageUpdatedOk,
    } = args
    let { notionalUsd } = args

    // Prepare expected results first...
    const expected: UpdatedPositionAndLeverageResult = {
      updatePositionSkipped: !hasMinimalLiability,
      updatedPositionResult: { ok: true, value: {} as UpdatedPosition },
      updateLeverageSkipped: !isFundTransferExpected,
      updatedLeverageResult: { ok: true, value: {} as UpdatedBalance },
    }

    expected.updatePositionSkipped = !hasMinimalLiability
    expected.updatedPositionResult.ok = expectPositionUpdatedOk
    expected.updateLeverageSkipped = !isFundTransferExpected
    expected.updatedLeverageResult.ok = expectLeverageUpdatedOk

    if (hasMinimalLiability && expected.updatedPositionResult.ok) {
      const position: Position = {
        leverageRatio:
          Math.max(notionalUsd, notionalUsdAfterOrder) / lastPriceInUsd / marginInBtc,
        collateralInUsd: marginInBtc * lastPriceInUsd,
        exposureInUsd: Math.max(notionalUsd, notionalUsdAfterOrder),
        totalAccountValueInUsd: NaN,
      }
      expected.updatedPositionResult.value.updatedPosition = position
    }

    if (hasMinimalLiability && expected.updatedLeverageResult.ok) {
      const balance: UpdatedBalance = {
        originalLeverageRatio:
          Math.max(notionalUsd, notionalUsdAfterOrder) / lastPriceInUsd / marginInBtc,
        liabilityInUsd: liabilityInUsd,
        collateralInUsd: marginInBtc * lastPriceInUsd,
        newLeverageRatio:
          Math.max(notionalUsd, notionalUsdAfterOrder) / lastPriceInUsd / marginInBtc,
      }
      expected.updatedLeverageResult.value = balance
    }

    this.expectedResults.push({ comment: comment, result: expected })

    // ...then sequence the api calls

    // Update in-flight
    // If wasFundTransferExpected (in the previous step)
    //  If wasTransferWithdraw
    //    exchange.fetchWithdrawals()
    //  Else // deposit
    //    exchange.fetchDeposits()

    // Position Loop
    //
    // exchange.fetchTicker()
    // wallet.getWalletUsdBalance()
    //
    // If hasMinimalLiability
    //  exchange.fetchPosition()
    //  exchange.fetchBalance()
    //  If order expected
    //      exchange.publicGetPublicInstruments()
    //      if order size ok
    //          exchange.createMarketOrder()
    //          exchange.fetchOrder()           x this.numberFetchIteration
    //          if lastOrderStatus is "closed"
    //            exchange.fetchPosition()
    //            exchange.fetchBalance()

    // Collateral Loop
    //
    // wallet.getWalletOnChainDepositAddress()
    // exchange.fetchPosition()
    // exchange.fetchBalance()
    //
    // If isFundTransferExpected
    //     If isTransferWithdraw
    //         exchange.withdraw()
    //     Else // deposit
    //         exchange.fetchDepositAddress()
    //         wallet.payOnChain()

    // Update in-flight
    if (wasFundTransferExpected) {
      if (wasTransferWithdraw) {
        this.exchangeMockObject.fetchWithdrawals.mockImplementationOnce(
          (code, since, limit, params) => {
            const args = {
              address: params.address,
              amountInBtc: sat2btc(params.amountInSats),
              status: FundTransferStatus.Ok, // <-- Always successful for now
            }
            return getValidFetchWithdrawalsResponse(args)
          },
        )
      } else {
        this.exchangeMockObject.fetchDeposits.mockImplementationOnce(
          (code, since, limit, params) => {
            const args = {
              address: params.address,
              amountInBtc: sat2btc(params.amountInSats),
              status: FundTransferStatus.Ok, // <-- Always successful for now
            }
            return getValidFetchDepositsResponse(args)
          },
        )
      }
    }

    // Position Loop
    console.log("Mock: fetchTicker()")
    this.exchangeMockObject.fetchTicker.mockImplementationOnce((instrumentId: string) => {
      return getValidFetchTickerResponse(instrumentId, lastPriceInUsd)
    })
    this.walletMockObject.getWalletUsdBalance.mockImplementationOnce(
      (): Result<number> => {
        const amount = -liabilityInUsd
        return { ok: true, value: amount }
      },
    )

    if (hasMinimalLiability) {
      this.exchangeMockObject.fetchPosition.mockImplementationOnce(() => {
        return getValidFetchPositionResponse(lastPriceInUsd, notionalUsd, marginInBtc)
      })
      this.exchangeMockObject.fetchBalance.mockImplementationOnce(() => {
        return getValidFetchBalanceResponse(totalEquity)
      })
      if (isOrderExpected) {
        this.exchangeMockObject.publicGetPublicInstruments.mockImplementationOnce(
          ({ instType, instId }) => {
            return getValidPublicGetPublicInstrumentsResponse({ instType, instId })
          },
        )
        if (isOrderSizeOk) {
          this.exchangeMockObject.createMarketOrder.mockImplementationOnce(
            (args: CreateOrderParameters) => {
              return getValidCreateMarketOrderResponse(orderId)
            },
          )
          console.log("Mock: fetchOrder(0)")
          this.exchangeMockObject.fetchOrder.mockImplementationOnce(
            (id: string, instrumentId: string) => {
              return getValidFetchOrderResponse(id, instrumentId, firstOrderStatus)
            },
          )
          if (numberFetchIteration > 1) {
            if (numberFetchIteration > 2) {
              for (let i = 0; i < numberFetchIteration - 1; i++) {
                console.log(`Mock: fetchOrder(${i + 1})`)
                this.exchangeMockObject.fetchOrder.mockImplementationOnce(
                  (id: string, instrumentId: string) => {
                    return getValidFetchOrderResponse(id, instrumentId, firstOrderStatus)
                  },
                )
              }
            }
            console.log(`Mock: fetchOrder(${numberFetchIteration})`)
            this.exchangeMockObject.fetchOrder.mockImplementationOnce(
              (id: string, instrumentId: string) => {
                return getValidFetchOrderResponse(id, instrumentId, lastOrderStatus)
              },
            )
          }
          if (lastOrderStatus === OrderStatus.Closed) {
            // set notional to total equity to represent the order
            if (wasFundTransferExpected) {
              notionalUsd = notionalUsdAfterOrder
            }
            this.exchangeMockObject.fetchPosition.mockImplementationOnce(() => {
              return getValidFetchPositionResponse(
                lastPriceInUsd,
                notionalUsdAfterOrder,
                marginInBtc,
              )
            })
            this.exchangeMockObject.fetchBalance.mockImplementationOnce(() => {
              return getValidFetchBalanceResponse(totalEquity)
            })
          }
        }
      }
    }

    // Collateral Loop
    this.walletMockObject.getWalletOnChainDepositAddress.mockImplementationOnce(
      (): Result<string> => {
        const datetime = dateFormat(new Date(), DATE_FORMAT_STRING)
        const address = `bc1q00wallet0000000000000000000000000000datetime${datetime}`
        return { ok: true, value: address }
      },
    )
    this.exchangeMockObject.fetchPosition.mockImplementationOnce(() => {
      return getValidFetchPositionResponse(lastPriceInUsd, notionalUsd, marginInBtc)
    })
    this.exchangeMockObject.fetchBalance.mockImplementationOnce(() => {
      return getValidFetchBalanceResponse(totalEquity)
    })
    if (isFundTransferExpected) {
      if (isTransferWithdraw) {
        this.exchangeMockObject.withdraw.mockImplementationOnce((currency, quantity) => {
          return getValidWithdrawResponse("0", currency, quantity)
        })
      } else {
        this.exchangeMockObject.fetchDepositAddress.mockImplementationOnce(() => {
          return getValidFetchDepositAddressResponse()
        })
        this.walletMockObject.payOnChain.mockImplementationOnce(
          (address: string, btcAmountInSats: number, memo: string): Result<void> => {
            return { ok: true, value: undefined }
          },
        )
      }
    }
  }
}
