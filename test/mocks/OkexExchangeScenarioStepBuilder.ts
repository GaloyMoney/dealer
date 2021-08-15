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

function getValidWithdrawResponse(id: string, currency, amountInBtc) {
  console.log("Called: getValidWithdrawResponse()")
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

function getValidCreateMarketOrderResponse(id: number) {
  return { id: `${id}` }
}

function getValidFetchOrderResponse(
  id: string,
  instrumentId: string,
  status: OrderStatus,
) {
  console.log(`Called: getValidFetchOrderResponse(${id}, ${instrumentId}, ${status})`)
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

export class OkexExchangeScenarioStepBuilder {
  private exchangeMockObject
  private walletMockObject

  private expectedResults = [] as ExpectedResult[]

  constructor() {
    this.exchangeMockObject = {
      checkRequiredCredentials: jest.fn().mockReturnValue(true),
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

  public getExchangeMockObject() {
    return this.exchangeMockObject
  }

  public getWalletMockObject() {
    return this.walletMockObject
  }

  public getExpectedValues(): ExpectedResult[] {
    return this.expectedResults
  }

  public addScenarioStep(args: StepInput) {
    const {
      lastPriceInUsd,
      liabilityInUsd,
      notionalUsd,
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
        leverageRatio: notionalUsd / lastPriceInUsd / marginInBtc,
        collateralInUsd: marginInBtc * lastPriceInUsd,
        exposureInUsd: notionalUsd,
        totalAccountValueInUsd: NaN,
      }
      expected.updatedPositionResult.value.updatedPosition = position
    }

    if (hasMinimalLiability && expected.updatedLeverageResult.ok) {
      const balance: UpdatedBalance = {
        originalLeverageRatio: notionalUsd / lastPriceInUsd / marginInBtc,
        liabilityInUsd: liabilityInUsd,
        collateralInUsd: marginInBtc * lastPriceInUsd,
        newLeverageRatio: notionalUsd / lastPriceInUsd / marginInBtc,
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
    //          exchange.fetchPosition()
    //          exchange.fetchBalance()

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
          ({ address, amountInSats }) => {
            const args = {
              address: address,
              amountInBtc: sat2btc(amountInSats),
              status: FundTransferStatus.Ok, // <-- Always successful for now
            }
            return getValidFetchWithdrawalsResponse(args)
          },
        )
      } else {
        this.exchangeMockObject.fetchDeposits.mockImplementationOnce(
          ({ address, amountInSats }) => {
            const args = {
              address: address,
              amountInBtc: sat2btc(amountInSats),
              status: FundTransferStatus.Ok, // <-- Always successful for now
            }
            return getValidFetchDepositsResponse(args)
          },
        )
      }
    }

    // Position Loop
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
          this.exchangeMockObject.fetchOrder.mockImplementationOnce(
            (id: string, instrumentId: string) => {
              return getValidFetchOrderResponse(id, instrumentId, firstOrderStatus)
            },
          )
          if (numberFetchIteration > 1) {
            if (numberFetchIteration > 2) {
              for (let i = 0; i < numberFetchIteration - 1; i++) {
                this.exchangeMockObject.fetchOrder.mockImplementationOnce(
                  (id: string, instrumentId: string) => {
                    return getValidFetchOrderResponse(id, instrumentId, firstOrderStatus)
                  },
                )
              }
            }
            this.exchangeMockObject.fetchOrder.mockImplementationOnce(
              (id: string, instrumentId: string) => {
                return getValidFetchOrderResponse(id, instrumentId, lastOrderStatus)
              },
            )
          }
          this.exchangeMockObject.fetchPosition.mockImplementationOnce(() => {
            return getValidFetchPositionResponse(lastPriceInUsd, notionalUsd, marginInBtc)
          })
          this.exchangeMockObject.fetchBalance.mockImplementationOnce(() => {
            return getValidFetchBalanceResponse(totalEquity)
          })
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
        console.log("Add this.walletMockObject.payOnChain() mock call")
        this.walletMockObject.payOnChain.mockImplementationOnce(
          (address: string, btcAmountInSats: number, memo: string): Result<void> => {
            console.log(`Called: payOnChain(${address}, ${btcAmountInSats}, ${memo})`)
            return { ok: true, value: undefined }
          },
        )
      }
    }
  }
}
