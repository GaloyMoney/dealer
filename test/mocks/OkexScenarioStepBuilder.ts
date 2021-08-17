import dateFormat from "dateformat"
import { UpdatedPositionAndLeverageResult } from "src/Dealer"
import {
  OrderStatus,
  FundTransferStatus,
  CreateOrderParameters,
} from "src/ExchangeTradingType"
import { Position, UpdatedBalance, UpdatedPosition } from "src/HedgingStrategyTypes"
import { baseLogger } from "src/logger"
import { Result } from "src/Result"
import { sat2btc } from "src/utils"

import {
  DATE_FORMAT_STRING,
  getValidFetchDepositAddressResponse,
  getValidFetchDepositsResponse,
  getValidWithdrawResponse,
  getValidFetchWithdrawalsResponse,
  getValidCreateMarketOrderResponse,
  getValidFetchOrderResponse,
  getValidFetchBalanceResponse,
  getValidFetchPositionResponse,
  getValidFetchTickerResponse,
  getValidPublicGetPublicInstrumentsResponse,
} from "./ExchangeApiResponseHelper"

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

export class ExchangeMockStats {
  public fetchDeposits = 0
  public fetchWithdrawals = 0
  public fetchTicker = 0
  public fetchPosition = 0
  public fetchBalance = 0
  public publicGetPublicInstruments = 0
  public createMarketOrder = 0
  public fetchOrder = 0
  public withdraw = 0
  public fetchDepositAddress = 0
}

export class WalletMockStats {
  public getWalletUsdBalance = 0
  public getWalletOnChainDepositAddress = 0
  public payOnChain = 0
}

export interface ExpectedResult {
  comment: string
  exchangeMockStats: ExchangeMockStats
  walletMockStats: WalletMockStats
  result: UpdatedPositionAndLeverageResult
}

export class OkexExchangeScenarioStepBuilder {
  public static getCleanExchangeMock(): ExchangeMock {
    const exchangeMock = {
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
    return exchangeMock
  }

  public static getCleanWalletMock(): WalletMock {
    const walletMock = {
      getWalletUsdBalance: jest.fn(),
      getWalletOnChainDepositAddress: jest.fn(),
      payOnChain: jest.fn(),
    }
    return walletMock
  }

  public static mockScenarioStep(
    args: StepInput,
    exchangeMock: ExchangeMock,
    walletMock: WalletMock,
  ): ExpectedResult {
    const {
      lastPriceInUsd,
      liabilityInUsd,
      notionalUsd,
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

    const expectedResult = {
      comment: comment,
      exchangeMockStats: new ExchangeMockStats(),
      walletMockStats: new WalletMockStats(),
      result: expected,
    }

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
        expectedResult.exchangeMockStats.fetchWithdrawals++
        exchangeMock.fetchWithdrawals.mockImplementationOnce(
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
        expectedResult.exchangeMockStats.fetchDeposits++
        exchangeMock.fetchDeposits.mockImplementationOnce(
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
    expectedResult.exchangeMockStats.fetchTicker++
    exchangeMock.fetchTicker.mockImplementationOnce((instrumentId: string) => {
      return getValidFetchTickerResponse(instrumentId, lastPriceInUsd)
    })
    expectedResult.walletMockStats.getWalletUsdBalance++
    walletMock.getWalletUsdBalance.mockImplementationOnce((): Result<number> => {
      const amount = -liabilityInUsd
      return { ok: true, value: amount }
    })

    if (hasMinimalLiability) {
      expectedResult.exchangeMockStats.fetchPosition++
      exchangeMock.fetchPosition.mockImplementationOnce(() => {
        return getValidFetchPositionResponse(lastPriceInUsd, notionalUsd, marginInBtc)
      })
      expectedResult.exchangeMockStats.fetchBalance++
      exchangeMock.fetchBalance.mockImplementationOnce(() => {
        return getValidFetchBalanceResponse(totalEquity)
      })
      if (isOrderExpected) {
        expectedResult.exchangeMockStats.publicGetPublicInstruments++
        exchangeMock.publicGetPublicInstruments.mockImplementationOnce(
          ({ instType, instId }) => {
            return getValidPublicGetPublicInstrumentsResponse({ instType, instId })
          },
        )
        if (isOrderSizeOk) {
          expectedResult.exchangeMockStats.createMarketOrder++
          exchangeMock.createMarketOrder.mockImplementationOnce(
            (args: CreateOrderParameters) => {
              return getValidCreateMarketOrderResponse(orderId)
            },
          )
          expectedResult.exchangeMockStats.fetchOrder++
          exchangeMock.fetchOrder.mockImplementationOnce(
            (id: string, instrumentId: string) => {
              return getValidFetchOrderResponse(id, instrumentId, firstOrderStatus)
            },
          )
          if (numberFetchIteration > 1) {
            if (numberFetchIteration > 2) {
              for (let i = 0; i < numberFetchIteration - 1; i++) {
                expectedResult.exchangeMockStats.fetchOrder++
                exchangeMock.fetchOrder.mockImplementationOnce(
                  (id: string, instrumentId: string) => {
                    return getValidFetchOrderResponse(id, instrumentId, firstOrderStatus)
                  },
                )
              }
            }
            expectedResult.exchangeMockStats.fetchOrder++
            exchangeMock.fetchOrder.mockImplementationOnce(
              (id: string, instrumentId: string) => {
                return getValidFetchOrderResponse(id, instrumentId, lastOrderStatus)
              },
            )
          }
          if (lastOrderStatus === OrderStatus.Closed) {
            expectedResult.exchangeMockStats.fetchPosition++
            exchangeMock.fetchPosition.mockImplementationOnce(() => {
              return getValidFetchPositionResponse(
                lastPriceInUsd,
                notionalUsdAfterOrder,
                marginInBtc,
              )
            })
            expectedResult.exchangeMockStats.fetchBalance++
            exchangeMock.fetchBalance.mockImplementationOnce(() => {
              return getValidFetchBalanceResponse(totalEquity)
            })
          }
        }
      }
    }

    // Collateral Loop
    expectedResult.walletMockStats.getWalletOnChainDepositAddress++
    walletMock.getWalletOnChainDepositAddress.mockImplementationOnce(
      (): Result<string> => {
        const datetime = dateFormat(new Date(), DATE_FORMAT_STRING)
        const address = `bc1q00wallet0000000000000000000000000000datetime${datetime}`
        return { ok: true, value: address }
      },
    )
    expectedResult.exchangeMockStats.fetchPosition++
    exchangeMock.fetchPosition.mockImplementationOnce(() => {
      return getValidFetchPositionResponse(
        lastPriceInUsd,
        Math.max(notionalUsd, notionalUsdAfterOrder),
        marginInBtc,
      )
    })
    expectedResult.exchangeMockStats.fetchBalance++
    exchangeMock.fetchBalance.mockImplementationOnce(() => {
      return getValidFetchBalanceResponse(totalEquity)
    })
    if (isFundTransferExpected) {
      if (isTransferWithdraw) {
        expectedResult.exchangeMockStats.withdraw++
        exchangeMock.withdraw.mockImplementationOnce((currency, quantity) => {
          return getValidWithdrawResponse("0", currency, quantity)
        })
      } else {
        expectedResult.exchangeMockStats.fetchDepositAddress++
        exchangeMock.fetchDepositAddress.mockImplementationOnce(() => {
          return getValidFetchDepositAddressResponse()
        })
        expectedResult.walletMockStats.payOnChain++
        walletMock.payOnChain.mockImplementationOnce(
          (address: string, btcAmountInSats: number, memo: string): Result<void> => {
            return { ok: true, value: undefined }
          },
        )
      }
    }

    baseLogger.warn(`expectedResult = ${JSON.stringify(expectedResult)}`)
    return expectedResult
  }

  public static checkScenarioCallStats(
    expected: ExpectedResult,
    exchangeMock: ExchangeMock,
    walletMock: WalletMock,
  ): boolean {
    // fetchDeposits
    OkexExchangeScenarioStepBuilder.validateMockCalls(
      "fetchDeposits",
      exchangeMock.fetchDeposits.mock.calls.length,
      exchangeMock.fetchDeposits.mock,
      expected.exchangeMockStats.fetchDeposits,
    )
    exchangeMock.fetchDeposits.mockClear()

    // fetchWithdrawals
    OkexExchangeScenarioStepBuilder.validateMockCalls(
      "fetchWithdrawals",
      exchangeMock.fetchWithdrawals.mock.calls.length,
      exchangeMock.fetchWithdrawals.mock,
      expected.exchangeMockStats.fetchWithdrawals,
    )
    exchangeMock.fetchWithdrawals.mockClear()

    // fetchTicker
    OkexExchangeScenarioStepBuilder.validateMockCalls(
      "fetchTicker",
      exchangeMock.fetchTicker.mock.calls.length,
      exchangeMock.fetchTicker.mock,
      expected.exchangeMockStats.fetchTicker,
    )
    exchangeMock.fetchTicker.mockClear()

    // fetchPosition
    OkexExchangeScenarioStepBuilder.validateMockCalls(
      "fetchPosition",
      exchangeMock.fetchPosition.mock.calls.length,
      exchangeMock.fetchPosition.mock,
      expected.exchangeMockStats.fetchPosition,
    )
    exchangeMock.fetchPosition.mockClear()

    // fetchBalance
    OkexExchangeScenarioStepBuilder.validateMockCalls(
      "fetchBalance",
      exchangeMock.fetchBalance.mock.calls.length,
      exchangeMock.fetchBalance.mock,
      expected.exchangeMockStats.fetchBalance,
    )
    exchangeMock.fetchBalance.mockClear()

    // publicGetPublicInstruments
    OkexExchangeScenarioStepBuilder.validateMockCalls(
      "publicGetPublicInstruments",
      exchangeMock.publicGetPublicInstruments.mock.calls.length,
      exchangeMock.publicGetPublicInstruments.mock,
      expected.exchangeMockStats.publicGetPublicInstruments,
    )
    exchangeMock.publicGetPublicInstruments.mockClear()

    // createMarketOrder
    OkexExchangeScenarioStepBuilder.validateMockCalls(
      "createMarketOrder",
      exchangeMock.createMarketOrder.mock.calls.length,
      exchangeMock.createMarketOrder.mock,
      expected.exchangeMockStats.createMarketOrder,
    )
    exchangeMock.createMarketOrder.mockClear()

    // fetchOrder
    OkexExchangeScenarioStepBuilder.validateMockCalls(
      "fetchOrder",
      exchangeMock.fetchOrder.mock.calls.length,
      exchangeMock.fetchOrder.mock,
      expected.exchangeMockStats.fetchOrder,
    )
    exchangeMock.fetchOrder.mockClear()

    // withdraw
    OkexExchangeScenarioStepBuilder.validateMockCalls(
      "withdraw",
      exchangeMock.withdraw.mock.calls.length,
      exchangeMock.withdraw.mock,
      expected.exchangeMockStats.withdraw,
    )
    exchangeMock.withdraw.mockClear()

    // fetchDepositAddress
    OkexExchangeScenarioStepBuilder.validateMockCalls(
      "fetchDepositAddress",
      exchangeMock.fetchDepositAddress.mock.calls.length,
      exchangeMock.fetchDepositAddress.mock,
      expected.exchangeMockStats.fetchDepositAddress,
    )
    exchangeMock.fetchDepositAddress.mockClear()

    // getWalletUsdBalance
    OkexExchangeScenarioStepBuilder.validateMockCalls(
      "getWalletUsdBalance",
      walletMock.getWalletUsdBalance.mock.calls.length,
      walletMock.getWalletUsdBalance.mock,
      expected.walletMockStats.getWalletUsdBalance,
    )
    walletMock.getWalletUsdBalance.mockClear()

    // getWalletOnChainDepositAddress
    OkexExchangeScenarioStepBuilder.validateMockCalls(
      "getWalletOnChainDepositAddress",
      walletMock.getWalletOnChainDepositAddress.mock.calls.length,
      walletMock.getWalletOnChainDepositAddress.mock,
      expected.walletMockStats.getWalletOnChainDepositAddress,
    )
    walletMock.getWalletOnChainDepositAddress.mockClear()

    // payOnChain
    OkexExchangeScenarioStepBuilder.validateMockCalls(
      "payOnChain",
      walletMock.payOnChain.mock.calls.length,
      walletMock.payOnChain.mock,
      expected.walletMockStats.payOnChain,
    )
    walletMock.payOnChain.mockClear()
    return true
  }

  public static validateMockCalls(
    fnName: string,
    callCount: number,
    context: jest.MockContext<any, any>,
    expectedCallCount: number,
  ) {
    if (callCount !== expectedCallCount) {
      baseLogger.error(
        { fnName, callCount, expectedCallCount, context },
        "Error: mock call count vs expected count mismatch",
      )
    }
    expect(callCount).toBe(expectedCallCount)
  }
}
